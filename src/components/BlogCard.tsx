import Link from "next/link";
import { ImageIcon } from "lucide-react";

interface BlogCardProps {
  title: string;
  slug: string;
  summary: string;
  imageUrl: string;
  category: string;
  publishedAt: string;
  bordered?: boolean;
  aspectRatio?: string;
}

export default function BlogCard({
  title,
  slug,
  summary,
  imageUrl,
  category,
  publishedAt,
  bordered = false,
  aspectRatio = "aspect-[4/3]"
}: BlogCardProps) {
  return (
    <Link
      href={`/blogs/${slug}`}
      className={`group cursor-pointer flex flex-col gap-4 text-left ${
        bordered
          ? "bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[32px] p-5 shadow-sm hover:border-[var(--border-hover)] transition-all duration-350"
          : ""
      }`}
    >
      {/* Image wrapper */}
      <div className={`relative ${aspectRatio} rounded-[24px] overflow-hidden shadow-sm border border-[var(--border-color)] bg-black/20`}>
        {imageUrl ? (
          <img
            src={imageUrl || undefined}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/logo.png";
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={28} className="text-[var(--text-muted)]" />
          </div>
        )}
        {/* Badge */}
        <span className="bg-white/95 text-[#7B1123] px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase rounded-md absolute top-3 left-3 border border-[#C59B27]/40 font-primary shadow-sm">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 px-1">
        <h4 className="text-xs md:text-sm font-black text-[var(--text-primary)] font-primary uppercase leading-snug tracking-tight group-hover:text-[#7B1123] transition-colors flex items-start gap-2 justify-between">
          <span className="flex-1 line-clamp-2">{title}</span>
          <span className="inline-block shrink-0 text-[#C59B27] group-hover:text-[#7B1123] transition-colors font-primary text-sm leading-none mt-0.5">
            ↗
          </span>
        </h4>

        <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed line-clamp-2 font-secondary">
          {summary}
        </p>

        <div className="flex items-center mt-2 pt-3 border-t border-[var(--border-color)]">
          <span className="text-[var(--text-muted)] text-[10px] font-primary">
            {publishedAt}
          </span>
        </div>
      </div>
    </Link>
  );
}
