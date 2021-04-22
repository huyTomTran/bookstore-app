using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using DbUp;
using bookstore_app.Data;
using bookstore_app.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using bookstore_app.Authorization;

namespace bookstore_app
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // This gets the database connection from the appsettings.json file 
            // and creates the database if it doesn't exist
            var connectionString = Configuration.GetConnectionString("DefaultConnection");
            EnsureDatabase.For.SqlDatabase(connectionString);

            //  Create and configure an instance of the DbUp upgrader
            var upgrader = DeployChanges.To
                            .SqlDatabase(connectionString, null)
                            .WithScriptsEmbeddedInAssembly(
                                System.Reflection.Assembly.GetExecutingAssembly()
                            )
                            .WithTransaction()
                            .Build();

            // Do a database migration if there are any pending SQL Scripts
            if (upgrader.IsUpgradeRequired())
            {
                upgrader.PerformUpgrade();
            }

            services.AddControllers();

            //  tells ASP.NET Core that whenever IDataRepository is referenced in a constructor, substitute an instance of the DataRepository class
            //  "AddScoped" method means that only one instance of the DataRepository class is created in a given HTTP request. 
            //  This means the lifetime of the class that is created lasts for the whole HTTP request
            services.AddScoped<IDataRepository, DataRepository>();

            //  define CORS policy that allows front-end app hosted in 'localhost:3000' origin to access our backend
            services.AddCors(options =>
                options.AddPolicy("CorsPolicy", builder =>
                    builder.AllowAnyMethod()
                        .AllowAnyHeader()
                        //.WithOrigins("http://localhost:3000")
                        .WithOrigins(Configuration["Frontend"])
                        .AllowCredentials()));


            //  add SignalR to our ASP.NET Core app
            services.AddSignalR();

            //  add Memory Cache to our ASP.NET Core app
            services.AddMemoryCache();
            //  register our cache as a singleton in the dependency injection system. 
            //  This means that a single instance of our class will be created for the lifetime of the app.
            services.AddSingleton<IQuestionCache, QuestionCache>();

            //  adds JWT-based authentication specifying the authority and expected audience
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.Authority = Configuration["Auth0:Authority"];
                options.Audience = Configuration["Auth0:Audience"];
            });

            //  make HTTP client available 
            services.AddHttpClient();
            //  add authorization policy which has its requirements defined in a class called "MustBeQuestionAuthorRequirement"
            services.AddAuthorization(options =>
                options.AddPolicy("MustBeQuestionAuthor", policy =>
                    policy.Requirements
                        .Add(new MustBeQuestionAuthorRequirement())));
            //  register handler for dependency injection,
            //  the handler for MustBeQuestionAuthorRequirement will be implemented in a class called MustBeQuestionAuthorHandler
            services.AddScoped<IAuthorizationHandler, MustBeQuestionAuthorHandler>();
            //  register HttpContextAccessor for dependency injection to get access to the HTTP request info to find out the question that is being requested
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            //  enable the use of the CORS policy in the Configure method
            app.UseCors("CorsPolicy");

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHttpsRedirection();

            }

            app.UseRouting();

            //  add JWT authentication middleware 
            app.UseAuthentication();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                //  configure the request pipeline so that we can pass SignalR requests to our SignalR hub
                endpoints.MapHub<QuestionsHub>("/questionshub");
            });
        }
    }
}
