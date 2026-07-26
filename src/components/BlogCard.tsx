import Link from "next/link";

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
          ? "bg-white border border-slate-200/80 rounded-[32px] p-5 shadow-sm hover:shadow-md transition-all duration-350"
          : ""
      }`}
    >
      {/* Image wrapper */}
      <div className={`relative ${aspectRatio} rounded-[24px] overflow-hidden shadow-sm border border-slate-200/80 bg-slate-50`}>
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge */}
        <span className="bg-white/95 text-slate-800 px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase rounded-md absolute top-3 left-3 border border-slate-200/80 font-primary shadow-sm">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 px-1">
        <h4 className="text-xs md:text-sm font-black text-slate-900 font-primary uppercase leading-snug tracking-tight group-hover:text-pink-500 transition-colors flex items-start gap-2 justify-between">
          <span className="flex-1 line-clamp-2">{title}</span>
          <span className="inline-block shrink-0 text-slate-400 group-hover:text-pink-500 transition-colors font-primary text-sm leading-none mt-0.5">
            ↗
          </span>
        </h4>
        
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed line-clamp-2 font-secondary">
          {summary}
        </p>

        <div className="flex items-center mt-2 pt-3 border-t border-slate-100/80">
          <span className="text-slate-450 text-[10px] font-primary">
            {publishedAt}
          </span>
        </div>
      </div>
    </Link>
  );
}
