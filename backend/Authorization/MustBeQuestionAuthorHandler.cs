using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using bookstore_app.Data;

namespace bookstore_app.Authorization
{
    //  This inherits from the AuthorizationHandler class, which takes in the requirement it is handling as a generic parameter.
    //  We have injected the data repository and the HTTP context into the class
    public class MustBeQuestionAuthorHandler : AuthorizationHandler<MustBeQuestionAuthorRequirement>
    {
        private readonly IDataRepository _dataRepository;
        private readonly IHttpContextAccessor _httpContextAssessor;

        public MustBeQuestionAuthorHandler(IDataRepository dataRepository, IHttpContextAccessor httpContextAccessor)
        {
            _dataRepository = dataRepository;
            _httpContextAssessor = httpContextAccessor;
        }
        protected async override Task HandleRequirementAsync(AuthorizationHandlerContext context, MustBeQuestionAuthorRequirement requirement)
        {
            // check that the user is authenticated
            if (!context.User.Identity.IsAuthenticated)
            {
                context.Fail();
                return;
            }
            // get the question id from the request
            var questionId = _httpContextAssessor.HttpContext.Request.RouteValues["questionId"];

            // get the user id from the name identifier claim
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            int questionIdAsInt = Convert.ToInt32(questionId);
            // get the question from the data repository
            var question = await _dataRepository.GetQuestion(questionIdAsInt);
            // if the question can't be found go to the next piece of middleware
            if (question == null)
            {
                //  let it through so the controller can return a 404 (not found)
                context.Succeed(requirement);
                return;
            }
            // return failure if the user id in the question from the data repository (our database) is different to the user id in the request
            if (question.UserId != userId)
            {
                context.Fail();
            }
            // return success if we manage to get here
            context.Succeed(requirement);
        }
    }
}