"use client";

import { useState } from "react";
import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { UserCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useCachedImage } from "~/lib/useCachedImage";

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

  // Use cached image hook for profile pictures
  const { imageUrl: cachedImageUrl, isLoading: imageLoading } = useCachedImage(
    user.image,
    {
      cacheKey: `profile_${user.id}`,
    },
  );

  const updateName = api.user.updateName.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      router.refresh();
    },
  });

  const deleteAccount = api.user.deleteAccount.useMutation({
    onSuccess: () => {
      router.push("/");
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
      <MenuButton className="hover:shadow-study flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-slate-700 backdrop-blur-sm transition-all duration-200 hover:bg-white">
        {cachedImageUrl && !imageLoading ? (
          <Image
            src={cachedImageUrl}
            alt="Profile"
            className="h-7 w-7 rounded-full"
            width={28}
            height={28}
            unoptimized
          />
        ) : (
          <UserCircleIcon className="h-7 w-7" />
        )}
        <span className="hidden text-sm font-medium sm:block">
          {user.name?.split(" ")[0] ?? "User"}
        </span>
        <ChevronDownIcon className="h-4 w-4 opacity-50" />
      </MenuButton>

      <MenuItems className="shadow-study-lg absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-2xl border border-slate-200 bg-white ring-1 ring-slate-200 focus:outline-none">
        <div className="p-6">
          <div className="mb-6 flex items-center gap-3">
            {cachedImageUrl && !imageLoading ? (
              <Image
                src={cachedImageUrl}
                alt="Profile"
                className="h-12 w-12 rounded-full"
                width={48}
                height={48}
                unoptimized
              />
            ) : (
              <div className="bg-primary-100 flex h-12 w-12 items-center justify-center rounded-full">
                <UserCircleIcon className="text-primary-600 h-8 w-8" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Display Name
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="focus:ring-primary-500 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-transparent focus:ring-2 focus:outline-none"
                    placeholder="Enter your name"
                  />
                  <button
                    onClick={() => {
                      updateName.mutate({ userId: user.id, name: newName });
                    }}
                    disabled={updateName.isPending}
                    className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded-lg px-3 py-2 text-slate-900 transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                  >
                    {updateName.isPending ? "..." : "Save"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-slate-900">
                    {user.name ?? "Not set"}
                  </span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-4">
              <button
                onClick={() => void signOut()}
                className="flex w-full items-center justify-center rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-200"
              >
                Sign Out
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex w-full items-center justify-center rounded-lg bg-red-50 px-4 py-2 font-medium text-red-700 transition-colors duration-200 hover:bg-red-100"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </MenuItems>
    </Menu>
  );
}
