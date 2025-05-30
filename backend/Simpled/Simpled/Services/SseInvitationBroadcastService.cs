using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading.Channels;
using Simpled.Dtos.BoardInvitations;

namespace Simpled.Services
{
    public class SseInvitationBroadcastService
    {
        private readonly ConcurrentDictionary<string, List<ChannelWriter<(string, string)>>> _userStreams = new();

        public void Register(string email, ChannelWriter<(string, string)> writer)
        {
            var list = _userStreams.GetOrAdd(email, _ => new List<ChannelWriter<(string, string)>>());
            lock (list)
            {
                list.Add(writer);
            }
        }

        public void Unregister(string email, ChannelWriter<(string, string)> writer)
        {
            if (_userStreams.TryGetValue(email, out var list))
            {
                lock (list)
                {
                    list.Remove(writer);
                }
            }
        }

        public async Task BroadcastInvitationAsync(string email, object invitationDto, string type)
        {
            if (_userStreams.TryGetValue(email, out var list))
            {
                var payload = new SseInvitationEventDto
                {
                    EventType = type,
                    Data = invitationDto
                };
                var json = JsonSerializer.Serialize(payload);
                var eventName = type == "board" ? "InvitationBoard" : "InvitationTeam";
                List<ChannelWriter<(string, string)>> toRemove = new();
                lock (list)
                {
                    foreach (var writer in list)
                    {
                        if (!writer.TryWrite((eventName, json)))
                        {
                            toRemove.Add(writer);
                        }
                    }
                    foreach (var wr in toRemove)
                        list.Remove(wr);
                }
            }
            await Task.CompletedTask;
        }
    }
} 