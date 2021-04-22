using Microsoft.AspNetCore.Authorization;

namespace bookstore_app.Authorization
{
    public class MustBeQuestionAuthorRequirement : IAuthorizationRequirement
    {
        public MustBeQuestionAuthorRequirement()
        {
        }
    }


}