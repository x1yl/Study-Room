"use client";

import { useState } from "react";
import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface ProfileMenuProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function ProfileMenu({ user }: ProfileMenuProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.name ?? "");
  const router = useRouter();

  const updateName = api.user.updateName.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      router.refresh();
    },
  });

  const deleteAccount = api.user.deleteAccount.useMutation({
    onSuccess: () => {
      router.push('/');
    },
  });

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      deleteAccount.mutate({ userId: user.id });
    }
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
        {user.image ? (
          <img
            src={user.image}
            alt="Profile"
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <UserCircleIcon className="h-8 w-8" />
        )}
      </MenuButton>

      <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="p-4">
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">Name</label>
            {isEditing ? (
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 text-sm text-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  onClick={() => {
                    updateName.mutate({ userId: user.id, name: newName });
                  }}
                  className="rounded bg-indigo-600 px-2 py-1 text-sm text-white hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{user.name}</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => void signOut()}
              className="block w-full rounded-md bg-gray-100 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-200"
            >
              Sign out
            </button>
            <button
              onClick={handleDeleteAccount}
              className="block w-full rounded-md bg-red-100 px-4 py-2 text-left text-sm text-red-700 hover:bg-red-200"
            >
              Delete account
            </button>
          </div>
        </div>
      </MenuItems>
    </Menu>
  );
}
