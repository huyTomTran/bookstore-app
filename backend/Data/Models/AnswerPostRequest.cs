using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace bookstore_app.Data.Models
{
    public class AnswerPostRequest
    {
        //  The "?" allows the property to have a shortcut syntax for Nullable<T>
        //  an int type defaults to 0, so we need to set QuestionId to "null" value. --> used for MODEL BINDING
        //  If the questionId type is nullable & is NOT in the request body, then the REQUIRED validation check will fail, which is what we want
        [Required]
        public int? QuestionId { get; set; }
        [Required]
        public string Content { get; set; }
    }
}
