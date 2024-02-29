import React from "react";
import { useQuery } from "react-query";
import { fetchUser } from "../api";

const ProfileButton = () => {
  const { data: user, isLoading: isUserLoading } = useQuery("user", fetchUser);
  return <button className="profile-btn">{user?.name} Surname</button>;
};

export default ProfileButton;
