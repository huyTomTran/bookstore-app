using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace bookstore_app.Hubs
{
    public class QuestionsHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();

            //  push a message from the server to the React client to inform it that a connection has been successfully made
            //  The first parameter in SendAsync is the handler name in the JavaScript client we need to call, 
            //  while the second parameter is the data to pass in as a parameter to that handler.
            await Clients.Caller.SendAsync("Message", "Successfully connected");
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await Clients.Caller.SendAsync("Message", "Successfully disconnected");
            await base.OnDisconnectedAsync(exception);
        }


        public async Task SubscribeQuestion(int questionId)
        {
            //  add the client to a group of clients interested in getting updates on the question
            //  If the group doesn't exist, SignalR will automatically create the group, which will be the case for the first client that subscribes to a question
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Question-{questionId}");
            //  send a message to the client to indicate that the subscription was successful
            await Clients.Caller.SendAsync("Message", "Successfully subscribed");
        }


        public async Task UnsubscribeQuestion(int questionId)
        {
            //  When all the clients have been removed from the group, SignalR will automatically remove the group
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Question-{questionId}");
            await Clients.Caller.SendAsync("Message", "Successfully unsubscribed");
        }
    }
}