import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export function useUser() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("quickpoll_user_id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("quickpoll_user_id", id);
    }
    setUserId(id);
  }, []);

  return { userId };
}