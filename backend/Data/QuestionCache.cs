using Microsoft.Extensions.Caching.Memory;
using bookstore_app.Data.Models;

namespace bookstore_app.Data
{
    public class QuestionCache : IQuestionCache
    {
        //  create a memory cache & set the cache limit to be 100 items
        private MemoryCache _cache { get; set; }
        public QuestionCache()
        {
            _cache = new MemoryCache(new MemoryCacheOptions
            {
                SizeLimit = 100
            });
        }


        //  method to get a cached question
        private string GetCacheKey(int questionId) =>
            $"Question-{questionId}";
        // when using TryGetValue method, "null" will be returned from our method if the question doesn't exist in the cache
        public QuestionGetSingleResponse Get(int questionId)
        {
            QuestionGetSingleResponse question;
            _cache.TryGetValue(
                GetCacheKey(questionId),
                out question);
            return question;
        }


        //  method to add a cached question
        //  the cache will start to remove questions from the cache when there are 100 questions in it
        public void Set(QuestionGetSingleResponse question)
        {
            var cacheEntryOptions =
                new MemoryCacheEntryOptions().SetSize(1);
            _cache.Set(
                GetCacheKey(question.QuestionId),
                question,
                cacheEntryOptions);
        }


        //  method to remove a cached question
        //  if the question doesn't exist in the cache, nothing will happen and no exception will be thrown

        public void Remove(int questionId)
        {
            _cache.Remove(GetCacheKey(questionId));
        }
    }
}