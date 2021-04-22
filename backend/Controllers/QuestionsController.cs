using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using bookstore_app.Data;
using bookstore_app.Data.Models;
using Microsoft.AspNetCore.SignalR;
using bookstore_app.Hubs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text.Json;


namespace bookstore_app.Controllers
{
    // our path will be "api/questions"
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionsController : ControllerBase
    {
        private readonly IDataRepository _dataRepository;
        private readonly IHubContext<QuestionsHub> _questionHubContext;
        private readonly IQuestionCache _cache;
        private readonly IHttpClientFactory _clientFactory;
        private readonly string _auth0UserInfo;


        // set reference to _dataRepository by using DEPENDENCY INJECTION
        // inject HTTP client as well as the path to get info about the user from Auth0 
        public QuestionsController(IDataRepository dataRepository, IHubContext<QuestionsHub> questionHubContext, IQuestionCache questionCache, IHttpClientFactory clientFactory, IConfiguration configuration)
        {
            _dataRepository = dataRepository;
            _questionHubContext = questionHubContext;
            _cache = questionCache;
            _clientFactory = clientFactory;
            _auth0UserInfo = $"{configuration["Auth0:Authority"]}userinfo";
        }


        //  this will unprotect action methods in a protected controller by using the "AllowAnonymous" attribute
        [AllowAnonymous]
        //  Creating an action method for getting questions & for searching --> MODEL BINDING
        [HttpGet]
        public async Task<IEnumerable<QuestionGetManyResponse>> GetQuestions(string search, bool includeAnswers, int page = 1, int pageSize = 20)
        {
            if (string.IsNullOrEmpty(search))
            {
                if (includeAnswers)
                {
                    // get all questions with answers from data repository
                    return await _dataRepository.GetQuestionsWithAnswers();
                }
                else
                {
                    // get all questions from data repository
                    return await _dataRepository.GetQuestions();
                }
            }
            else
            {
                //  call data repository question search that accept query parameters for the page number & page size,
                //  which are defaulted to 1 and 20, respectively
                return await _dataRepository.GetQuestionsBySearchWithPaging(search, page, pageSize);
            }
        }


        //  this will unprotect action methods in a protected controller by using the "AllowAnonymous" attribute
        [AllowAnonymous]
        //  Creating an action method for getting unanswered questions
        [HttpGet("unanswered")]
        public async Task<IEnumerable<QuestionGetManyResponse>> GetUnansweredQuestions()
        {
            return await _dataRepository.GetUnansweredQuestions();
        }


        //  this will unprotect action methods in a protected controller by using the "AllowAnonymous" attribute
        [AllowAnonymous]
        //  Creating an action method for getting a single question
        [HttpGet("{questionId}")]
        public async Task<ActionResult<QuestionGetSingleResponse>> GetQuestion(int questionId)
        {
            var question = _cache.Get(questionId);
            if (question == null)
            {
                // call the data repository to get the question
                question = await _dataRepository.GetQuestion(questionId);
                // return HTTP status code 404 if the question isn't found
                if (question == null)
                {
                    return NotFound();
                }
                _cache.Set(question);
            }
            // return question in response with status code 200
            return question;
        }


        //  this will protect the "questions" endpoint for POST method by asking for authorization
        [Authorize]
        //  Creating an action method for posting a question
        [HttpPost]
        public async Task<ActionResult<QuestionGetSingleResponse>> PostQuestion(QuestionPostRequest questionPostRequest)
        {
            // call the data repository to save the question 
            // by mapping the QuestionPostRequest received in the API controller to the QuestionFullPostRequest that our data repository expects                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
            var savedQuestion = await _dataRepository.PostQuestion(new QuestionPostFullRequest
            {
                Title = questionPostRequest.Title,
                Content = questionPostRequest.Content,
                //  ControllerBase contains a User property that gives us info about the authenticated user including the claims
                UserId = User.FindFirst(ClaimTypes.NameIdentifier).Value,
                UserName = await GetUserName(),
                Created = DateTime.UtcNow
            });
            // return HTTP status code 201
            return CreatedAtAction(nameof(GetQuestion),
                new { questionId = savedQuestion.QuestionId },
                savedQuestion);
        }



        //  this will protect the "questions" endpoint for PUT method by asking for authorization
        //  add policy to the Authorize attribute
        [Authorize(Policy = "MustBeQuestionAuthor")]
        //  Creating an action method for updating a question
        [HttpPut("{questionId}")]
        public async Task<ActionResult<QuestionGetSingleResponse>> PutQuestion(int questionId, QuestionPutRequest questionPutRequest)
        {
            //  get the question from the data repository
            var question = await _dataRepository.GetQuestion(questionId);
            //  return HTTP status code 404 if the question isn't found
            if (question == null)
            {
                return NotFound();
            }
            //  update the question model
            questionPutRequest.Title =
                string.IsNullOrEmpty(questionPutRequest.Title) ?
                    question.Title :
                    questionPutRequest.Title;
            questionPutRequest.Content =
                string.IsNullOrEmpty(questionPutRequest.Content) ?
                    question.Content :
                    questionPutRequest.Content;
            //  call the data repository with the updated question model to update the question in the database
            var savedQuestion = await _dataRepository.PutQuestion(questionId, questionPutRequest);
            //  when a question changes, we need to remove the item from the cache if it exists in the cache
            _cache.Remove(savedQuestion.QuestionId);
            // return the saved question 
            return savedQuestion;
        }


        //  this will protect the "questions" endpoint for POST method by asking for authorization
        //  add policy to the Authorize attribute
        [Authorize(Policy = "MustBeQuestionAuthor")]
        //  Creating an action method for deleting a question
        [HttpDelete("{questionId}")]
        public async Task<ActionResult> DeleteQuestion(int questionId)
        {
            var question = await _dataRepository.GetQuestion(questionId);
            if (question == null)
            {
                return NotFound();
            }
            await _dataRepository.DeleteQuestion(questionId);
            //  when a question is deleted, we need to remove it from the cache if it exists in the cache
            _cache.Remove(questionId);
            return NoContent();
        }



        //  this will protect the "questions" endpoint for POST method by asking for authorization
        [Authorize]
        //  Creating an action method for posting an answer
        [HttpPost("answer")]
        public async Task<ActionResult<AnswerGetResponse>> PostAnswer(AnswerPostRequest answerPostRequest)
        {
            var questionExists = await _dataRepository.QuestionExists(answerPostRequest.QuestionId.Value);
            if (!questionExists)
            {
                return NotFound();
            }
            // call the data repository to save the answer 
            // by mapping the AnswerPostRequest received in the API controller to the QuestionFullPostRequest that our data repository expects                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
            var savedAnswer =
                await _dataRepository.PostAnswer(new AnswerPostFullRequest
                {
                    QuestionId = answerPostRequest.QuestionId.Value,
                    Content = answerPostRequest.Content,
                    UserId = User.FindFirst(ClaimTypes.NameIdentifier).Value,
                    UserName = await GetUserName(),
                    Created = DateTime.UtcNow
                }
            );

            //  remove the question from the cache when an answer is being posted
            _cache.Remove(answerPostRequest.QuestionId.Value);

            //  push the updated question with the saved answer to all the clients that are subscribed to the question
            await _questionHubContext.Clients.Group($"Question-{answerPostRequest.QuestionId.Value}")
                .SendAsync("ReceiveQuestion", _dataRepository.GetQuestion(
                    answerPostRequest.QuestionId.Value));

            return savedAnswer;
        }



        //  create a method that will call Auth0 to get the username
        private async Task<string> GetUserName()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, _auth0UserInfo);
            request.Headers.Add("Authorization", Request.Headers["Authorization"].First());
            var client = _clientFactory.CreateClient();
            var response = await client.SendAsync(request);
            //  if the request is susccessful, then parase the response body into the User model
            //  we specify case-insensitive property mapping so that the camel case fields in the response map correctly to the title case properties in the class
            if (response.IsSuccessStatusCode)
            {
                var jsonContent = await response.Content.ReadAsStringAsync();
                var user = JsonSerializer.Deserialize<User>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                return user.Name;
            }
            else
            {
                return "";
            }

        }
    }
}
