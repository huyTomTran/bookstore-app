using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using bookstore_app.Data.Models;

namespace bookstore_app.Data
{
    public interface IDataRepository
    {
        //  create ASYNCHRONOUS methods that returns'Task' type
        Task<IEnumerable<QuestionGetManyResponse>> GetQuestions();
        Task<IEnumerable<QuestionGetManyResponse>> GetQuestionsWithAnswers();
        Task<IEnumerable<QuestionGetManyResponse>> GetQuestionsBySearch(string search);
        Task<IEnumerable<QuestionGetManyResponse>> GetQuestionsBySearchWithPaging(string search, int pageNumber, int pageSize);
        Task<IEnumerable<QuestionGetManyResponse>> GetUnansweredQuestions();
        Task<QuestionGetSingleResponse> GetQuestion(int questionId);
        Task<bool> QuestionExists(int questionId);


        //   ****** implement methods in our data repository to read the database ******
        Task<AnswerGetResponse> GetAnswer(int answerId);


        //   ****** implement methods in our data repository to write to the database ******
        Task<QuestionGetSingleResponse> PutQuestion(int questionId, QuestionPutRequest question);
        Task<QuestionGetSingleResponse> PostQuestion(QuestionPostFullRequest question);
        Task DeleteQuestion(int questionId);
        Task<AnswerGetResponse> PostAnswer(AnswerPostFullRequest answer);

    }
}