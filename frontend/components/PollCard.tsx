import React from "react";

type Option = { id: number; text: string; votes: number };
export default function PollCard({ poll, onVote, onLike }:
  { poll: any, onVote: (optionId: number) => void, onLike: () => void }) {

  const totalVotes = (poll.options || []).reduce((s: number, o: Option) => s + (o.votes || 0), 0);
  return (
    <div className="p-4 rounded-lg shadow bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{poll.title}</h3>
          <p className="text-sm text-gray-500">{poll.description}</p>
        </div>
        <div className="text-sm">{poll.likes || 0} ❤️</div>
      </div>

      <div className="mt-3">
        {(poll.options || []).map((opt: Option) => {
          const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
          return (
            <div key={opt.id} className="mb-3">
              <div className="flex justify-between">
                <div>{opt.text}</div>
                <div className="text-sm">{opt.votes} votes</div>
              </div>

              <div className="bg-gray-200 h-2 rounded mt-1 overflow-hidden">
                <div style={{ width: `${percent}%` }} className="h-2 rounded bg-blue-600" />
              </div>

              <div className="mt-2">
                <button className="px-2 py-1 border rounded text-sm" onClick={() => onVote(opt.id)}>Vote</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3">
        <button onClick={onLike} className="px-3 py-1 border rounded">Like</button>
      </div>
    </div>
  );
}
