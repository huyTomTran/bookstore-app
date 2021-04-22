using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using Dapper;
using bookstore_app.Data.Models;
using static Dapper.SqlMapper;


// implementation of all of the methods in the data repository for READING data
namespace bookstore_app.Data
{
    public class DataRepository : IDataRepository
    {
        private readonly string _connectionString;

        public DataRepository(IConfiguration configuration)
        {
            _connectionString = configuration["ConnectionStrings:DefaultConnection"];
        }


        //  Creating a repository method to get an answer
        public async Task<AnswerGetResponse> GetAnswer(int answerId)
        {
            //  "using" block to declare the database connection
            using (var connection = new SqlConnection(_connectionString))
            {
                //  open the connection
                await connection.OpenAsync();
                //  execute the procedure to get A single answer with method 'QueryFirstOrDefault'
                return await connection.QueryFirstOrDefaultAsync<AnswerGetResponse>(
                        @"EXEC dbo.Answer_Get_ByAnswerId 
                            @AnswerId = @AnswerId",
                        new { AnswerId = answerId }
                );
            }
        }



        //  Creating a repository method to get a single question by ID
        //  by using 'QueryFirstOrDefault' Dapper method to return a single record (or null if the record isn't found)
        public async Task<QuestionGetSingleResponse> GetQuestion(int questionId)
        {
            //  "using" block to declare the database connection
            using (var connection = new SqlConnection(_connectionString))
            {
                //  open the connection
                await connection.OpenAsync();
                //  use the QueryMultiple method in Dapper to execute our two stored procedures in a single database round trip
                using (GridReader results = await connection.QueryMultipleAsync(
                        @"EXEC dbo.Question_GetSingle
                            @QuestionId = @QuestionId;
                        EXEC dbo.Answer_Get_ByQuestionId
                            @QuestionId = @QuestionId",
                        new { QuestionId = questionId }
                    )
                )
                {
                    //  get the single question with method 'FirstOrDefault'
                    var question = (await results.ReadAsync<QuestionGetSingleResponse>()).FirstOrDefault();
                    if (question != null)
                    {
                        //  get ALL the answers for A single question
                        question.Answers = (await results.ReadAsync<AnswerGetResponse>()).ToList();
                    }
                    //  return results from "Read" method
                    return question;
                }
            }
        }



        // Creating a repository method to get questions
        public async Task<IEnumerable<QuestionGetManyResponse>> GetQuestions()
        {
            //  "using" block to declare the database connection
            using (var connection = new SqlConnection(_connectionString))
            {
                //  open the connection
                await connection.OpenAsync();
                //  execute the query
                return await connection.QueryAsync<QuestionGetManyResponse>(
                    @"EXEC dbo.Question_GetMany"
                );
            }
        }



        //  Creating a repository method to get ALL of the questions in the database, including the answers for each questions
        public async Task<IEnumerable<QuestionGetManyResponse>> GetQuestionsWithAnswers()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                var questionDictionary = new Dictionary<int, QuestionGetManyResponse>();

                return (await connection
                    .QueryAsync<
                        QuestionGetManyResponse,
                        AnswerGetResponse,
                        QuestionGetManyResponse>(
                                "EXEC dbo.Question_GetMany_WithAnswers",
                                map: (q, a) =>
                                {
                                    QuestionGetManyResponse question;

                                    if (!questionDictionary.TryGetValue(q.QuestionId, out question))
                                    {
                                        question = q;
                                        question.Answers =
                                            new List<AnswerGetResponse>();
                                        questionDictionary.Add(question.QuestionId, question);
                                    }
                                    question.Answers.Add(a);
                                    return question;
                                },
                                splitOn: "QuestionId"
                        )
                    )
                    .Distinct()
                    .ToList();
            }
        }



        // Creating a repository method to get questions by a search
        public async Task<IEnumerable<QuestionGetManyResponse>> GetQuestionsBySearch(string search)
        {
            //  "using" block to declare the database connection
            using (var connection = new SqlConnection(_connectionString))
            {
                //  open the connection
                await connection.OpenAsync();
                //  to prevent SQL injection attack, it is best to pass parameters into Dapper 
                //  here we used an anonymous object for the parameters to save us defining a class for the object
                return await connection.QueryAsync<QuestionGetManyResponse>(
                    @"EXEC dbo.Question_GetMany_BySearch 4
                        @Search = @Search",
                    new { Search = search }
                );
            }

        }



        //  Creating a repository method to get ALL of the questions in the database which will take in the page number and size as parameters
        public async Task<IEnumerable<QuestionGetManyResponse>> GetQuestionsBySearchWithPaging(string search, int pageNumber, int pageSize)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var parameters = new { Search = search, PageNumber = pageNumber, PageSize = pageSize };
                //  calling a stored procedure called "Question_GetMany_BySearch_WithPaging" to get the page of data passing in the search criteria, page number, and page size as parameters
                return await connection.QueryAsync<QuestionGetManyResponse>(
                    @"EXEC dbo.Question_GetMany_BySearch_WithPaging
                        @Search = @Search,
                        @PageNumber = @PageNumber,
                        @PageSize = @PageSize",
                        parameters
                );
            }
        }



        // Creating a repository method to get unanswered questions
        public async Task<IEnumerable<QuestionGetManyResponse>> GetUnansweredQuestions()
        {
            //  "using" block to declare the database connection
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                return await connection.QueryAsync<QuestionGetManyResponse>(
                    "EXEC dbo.Question_GetUnanswered"
                );
            }
        }




        //  Creating a repository method to check whether a question exists
        //  using the Dapper 'QueryFirst' method rather than 'QueryFirstOrDefault' because the stored procedure will always return a single record
        public async Task<bool> QuestionExists(int questionId)
        {
            //  "using" block to declare the database connection
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                return await connection.QueryFirstAsync<bool>(
                    @"EXEC dbo.Question_Exists 
                        @QuestionId = @QuestionId",
                    new { QuestionId = questionId }
                );
            }
        }



        // Creating a repository method to add a new question
        public async Task<QuestionGetSingleResponse> PostQuestion(QuestionPostFullRequest question)
        {
            //  "using" block to declare the database connection
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                //  this returns questionId from the stored procedure
                var questionId = await connection.QueryFirstAsync<int>(
                    @"EXEC dbo.Question_Post
                        @Title = @Title, @Content = @Content,
                        @UserId = @UserId, @Username = @Username,
                        @Created = @Created",
                    question
                );

                return await GetQuestion(questionId);
            }
        }



        // Creating a repository method to change a question
        public async Task<QuestionGetSingleResponse> PutQuestion(int questionId, QuestionPutRequest question)
        {
            //  "using" block to declare the database connection
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                //  we use the Dapper 'Execute' method because we are simply executing a stored procedure and not returning anything
                await connection.ExecuteAsync(
                    @"EXEC dbo.Question_Put
                        @QuestionId = @QuestionId,
                        @Title = @Title,
                        @Content = @Content",
                    new { QuestionId = questionId, question.Title, question.Content }
                );
                return await GetQuestion(questionId);
            }
        }



        //  Creating a repository method to delete a question
        public async Task DeleteQuestion(int questionId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                //  we use the Dapper 'Execute' method because we are simply executing a stored procedure and not returning anything
                await connection.ExecuteAsync(
                    @"EXEC dbo.Question_Delete
                        @QuestionId = @QuestionId",
                    new { QuestionId = questionId }
                );
            }
        }



        //  Creating a repository method to add an answer
        public async Task<AnswerGetResponse> PostAnswer(AnswerPostFullRequest answer)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                return await connection.QueryFirstAsync<AnswerGetResponse>(
                    @"EXEC dbo.Answer_Post
                        @QuestionId = @QuestionId, @Content = @Content,
                        @UserId = @UserId, @Username = @Username,
                        @Created = @Created",
                    answer
                );
            }
        }



    }
}