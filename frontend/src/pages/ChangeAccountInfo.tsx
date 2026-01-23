// src/pages/Settings.tsx
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { loginSuccess } from "../store/slices/authSlice";

// Example avatars
const AVATARS = [
  "https://assets.codepen.io/1480814/av+1.png",
  "https://i.pravatar.cc/160?img=5",
  "https://i.pravatar.cc/320?img=7",
  "https://i.pravatar.cc/640?img=11",
];

const Settings = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notifications, setNotifications] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.profileImage || AVATARS[0],
  );

  // Load saved settings from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) setTheme(savedTheme);

    const savedNotif = localStorage.getItem("notifications");
    if (savedNotif) setNotifications(savedNotif === "true");
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Handle toggles
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  const toggleNotifications = () => {
    setNotifications(!notifications);
    localStorage.setItem("notifications", (!notifications).toString());
  };

  // Change avatar
  const changeAvatar = (avatar: string) => {
    setSelectedAvatar(avatar);

    if (!user) return;
    const storedAuth = localStorage.getItem("auth");
    const token = storedAuth ? JSON.parse(storedAuth).token : "";
    const updatedUser = { ...user, profileImage: avatar };

    dispatch(loginSuccess({ user: updatedUser, token }));
    localStorage.setItem("auth", JSON.stringify({ user: updatedUser, token }));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-md space-y-6">
      <h2 className="text-xl font-bold">Settings</h2>

      {/* Theme toggle */}
      <div className="flex justify-between items-center">
        <span>Dark Mode</span>
        <input
          type="checkbox"
          className="toggle"
          checked={theme === "dark"}
          onChange={toggleTheme}
        />
      </div>

      {/* Notifications toggle */}
      <div className="flex justify-between items-center">
        <span>Email Notifications</span>
        <input
          type="checkbox"
          className="toggle"
          checked={notifications}
          onChange={toggleNotifications}
        />
      </div>

      {/* Avatar selection */}
      <div>
        <span className="font-semibold">Choose Avatar</span>
        <div className="flex space-x-4 mt-2">
          {AVATARS.map((avatar) => (
            <img
              key={avatar}
              src={avatar}
              alt="avatar"
              className={`w-16 h-16 rounded-full cursor-pointer border-4 ${
                selectedAvatar === avatar
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
              onClick={() => changeAvatar(avatar)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
