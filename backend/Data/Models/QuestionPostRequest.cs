using System.ComponentModel.DataAnnotations;

namespace bookstore_app.Data.Models
{
    public class QuestionPostRequest
    {
        [Required]
        //  This check will ensure the title doesn't have more than 100 characters
        [StringLength(100)]
        public string Title { get; set; }
        [Required(ErrorMessage = "Please include some content for the question")]
        public string Content { get; set; }
    }
}