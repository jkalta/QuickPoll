import React, { useState, useCallback } from "react";
import useSWR from "swr";
import { client } from "../lib/api";
import PollCard from "../components/PollCard";
import { useWebSocket } from "../hooks/useWebSocket";
import { useUser } from "../hooks/useUser";

const fetcher = (url: string) => client.get(url).then((res) => res.data);

export default function HomePage() {
  const { data, mutate } = useSWR("/polls", fetcher);
  const [form, setForm] = useState({ title: "", description: "", options: "" });
  const { userId } = useUser();

  // ✅ WebSocket listener: apply updates in-place
  useWebSocket("ws://localhost:8000/ws/polls", (msg) => {
    console.log("📬 WS message:", msg);
    mutate((currentData) => {
      if (!currentData) return currentData;

      // clone top level
      const updated = { ...currentData };

      if (msg.type === "vote") {
        updated.polls = currentData.polls.map((poll) => {
          if (poll.id !== msg.poll_id) return poll;
          return {
            ...poll,
            options: poll.options.map((opt) =>
              opt.id === msg.option_id ? { ...opt, votes: msg.votes } : opt
            ),
          };
        });
      } else if (msg.type === "like") {
        updated.polls = currentData.polls.map((poll) =>
          poll.id === msg.poll_id ? { ...poll, likes: msg.likes } : poll
        );
      } else if (msg.type === "new_poll") {
        // optional: trigger re-fetch
        return undefined;
      }

      return updated;
    }, false);
  });

  // ✅ Create new poll
  const handleCreate = useCallback(async () => {
    const payload = {
      title: form.title,
      description: form.description,
      options: form.options.split("\n").filter(Boolean),
    };
    await client.post("/polls", payload);
    setForm({ title: "", description: "", options: "" });
  }, [form]);

  // ✅ Voting
  const handleVote = useCallback(
    async (pollId: number, optionId: number) => {
      if (!userId) return;
      await client.post(`/polls/${pollId}/vote?option_id=${optionId}`, {
        user_id: userId,
      });
    },
    [userId]
  );

  // ✅ Liking
  const handleLike = useCallback(
    async (pollId: number) => {
      if (!userId) return;
      await client.post(`/polls/${pollId}/like`, { user_id: userId });
    },
    [userId]
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-neutral-50 py-10 px-4">
      <div className="w-full max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          QuickPoll 🗳️
        </h1>

        {/* Create Poll Form */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Create a Poll
          </h2>
          <input
            className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-400"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-400"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <textarea
            className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-400"
            placeholder="One option per line"
            value={form.options}
            onChange={(e) => setForm({ ...form, options: e.target.value })}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
            onClick={handleCreate}
          >
            Create Poll
          </button>
        </div>

        {/* Poll List */}
        <div className="space-y-4">
          {data?.polls?.length ? (
            data.polls.map((poll: any) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVote={(optionId) => handleVote(poll.id, optionId)}
                onLike={() => handleLike(poll.id)}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center mt-4">
              No polls yet. Create one!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
