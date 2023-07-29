"use client";

import { AddBookmark } from "@/actions/add-bookmark";
import { DeleteBookmark } from "@/actions/delete-bookmark";
import BookMarkOutline from "@/components/icons/bookmark-outline";
import BookMarkSolid from "@/components/icons/bookmark-solid";
import LoginSection from "@/components/login/login-section";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { buttonConfig } from "@/config/buttons";
import { supabase } from "@/utils/supabase-client";
import { Session } from "@supabase/auth-helpers-nextjs";
import { is } from "date-fns/locale";
import { Loader2 as SpinnerIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

interface BoomarkButtonProps {
  id: string;
}

const BoomarkButton: React.FC<BoomarkButtonProps> = ({ id }) => {
  const [isHovering, setIsHovered] = React.useState(false);
  const onMouseEnter = () => setIsHovered(true);
  const onMouseLeave = () => setIsHovered(false);
  const router = useRouter();
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(false);

  // Check authentitication and bookmark states
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    if (id && session?.user.id) {
      supabase
        .from("bookmarks")
        .select()
        .match({ id: id, user_id: session?.user.id })
        .then(({ data, error }) => {
          setIsBookmarked(true);
        });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [id, session?.user.id]);

  // Add bookmark
  async function addBookmark() {
    setIsLoading(true);

    if (id && session?.user.id) {
      const bookmarkData = {
        id: id,
        user_id: session?.user.id,
      };

      const response = await AddBookmark(bookmarkData);
      if (response) {
        setIsLoading(false);
        toast.success(buttonConfig.saved);
        router.refresh();
      } else {
        setIsLoading(false);
        toast.error(buttonConfig.error);
      }
    } else {
      setIsLoading(false);
      toast.error(buttonConfig.error);
    }
  }

  // Delete bookmark
  async function deleteBookmark() {
    setIsLoading(true);

    if (id && session?.user.id) {
      const bookmarkData = {
        id: id,
        user_id: session?.user.id,
      };

      const response = await DeleteBookmark(bookmarkData);
      if (response) {
        setIsLoading(false);
        toast.success(buttonConfig.deleted);
        router.refresh();
      } else {
        setIsLoading(false);
        toast.error(buttonConfig.error);
      }
    } else {
      setIsLoading(false);
      toast.error(buttonConfig.error);
    }
  }

  return (
    <>
      {session &&
        (isBookmarked ? (
          <button
            type="button"
            onClick={deleteBookmark}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="group relative mx-auto inline-flex w-full items-center justify-center rounded-md border border-black/5 bg-white py-2 hover:bg-gray-50 hover:shadow-sm"
          >
            {isLoading ? (
              <SpinnerIcon className="-ml-0.5 h-5 w-5 animate-spin" />
            ) : isHovering ? (
              <BookMarkOutline className="-ml-0.5 h-5 w-5 text-gray-400" />
            ) : (
              <BookMarkSolid className="-ml-0.5 h-5 w-5 text-gray-900" />
            )}
            <span className="ml-2 text-sm text-gray-400 group-hover:text-gray-900">
              {buttonConfig.unsave}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={addBookmark}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="group relative mx-auto inline-flex w-full items-center justify-center rounded-md border border-black/5 bg-white py-2 hover:bg-gray-50 hover:shadow-sm"
          >
            {isHovering ? (
              <BookMarkSolid className="-ml-0.5 h-5 w-5 text-gray-900" />
            ) : (
              <BookMarkOutline className="-ml-0.5 h-5 w-5 text-gray-400" />
            )}
            <span className="ml-2 text-sm text-gray-400 group-hover:text-gray-900">
              {buttonConfig.save}
            </span>
          </button>
        ))}
      {!session && (
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              className="group relative mx-auto inline-flex w-full items-center justify-center rounded-md border border-black/5 bg-white py-2 hover:bg-gray-50 hover:shadow-sm"
            >
              {isHovering ? (
                <BookMarkSolid className="-ml-0.5 h-5 w-5 text-gray-900" />
              ) : (
                <BookMarkOutline className="-ml-0.5 h-5 w-5 text-gray-400" />
              )}
              <span className="ml-2 text-sm text-gray-400 group-hover:text-gray-900">
                {buttonConfig.save}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="font-sans sm:max-w-[425px]">
            <LoginSection />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default BoomarkButton;
