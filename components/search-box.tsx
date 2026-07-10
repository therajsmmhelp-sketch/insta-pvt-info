"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";
import { searchFormSchema, type SearchFormValues } from "@/utils/validation";
import { cn } from "@/lib/utils";

interface SearchBoxProps {
  onSearch: (username: string) => void;
  isLoading: boolean;
}

export function SearchBox({ onSearch, isLoading }: SearchBoxProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: { username: "" },
  });

  const onSubmit = (values: SearchFormValues) => {
    onSearch(values.username);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="glass-panel rounded-2xl p-2 flex flex-col sm:flex-row items-stretch gap-2 shadow-2xl shadow-black/20">
        <div className="relative flex-1">
          <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            {...register("username")}
            placeholder="Enter Instagram username (e.g. natgeo)"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            disabled={isLoading}
            className={cn(
              "w-full bg-transparent pl-11 pr-4 py-3.5 text-base outline-none focus-ring placeholder:text-slate-500 rounded-xl disabled:opacity-60"
            )}
          />
        </div>
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-ig-gradient bg-[length:200%_200%] hover:bg-right transition-[background-position] duration-500 disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching…
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Search
            </>
          )}
        </motion.button>
      </div>
      {errors.username && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-rose-400 text-sm mt-2 pl-2"
        >
          {errors.username.message}
        </motion.p>
      )}
    </form>
  );
}
