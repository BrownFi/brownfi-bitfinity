const InvalidButton = ({ title }: { title: string | undefined }) => {
  return (
    <div className="flex items-center justify-center gap-2 self-stretch px-6 py-[18px] bg-[#737373]">
      <span className="text-base font-bold text-[rgba(255,255,255,0.50)]">
        {title}
      </span>
    </div>
  );
};

export default InvalidButton;
