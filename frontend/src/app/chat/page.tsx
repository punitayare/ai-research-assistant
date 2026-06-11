<>
  {/* MOBILE PDF SELECTOR */}
  <div className="md:hidden border-b border-white/10 bg-black/80 backdrop-blur-xl p-4 sticky top-0 z-50">
    <button
      onClick={() => setShowPdfs(!showPdfs)}
      className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
    >
      <span>
        PDFs ({selectedPdfs.length} selected)
      </span>

      <ChevronDown
        size={18}
        className={`transition ${
          showPdfs ? "rotate-180" : ""
        }`}
      />
    </button>

    {showPdfs && (
      <div className="mt-3 rounded-xl border border-white/10 bg-black max-h-60 overflow-y-auto">
        {pdfs.map((pdf, i) => (
          <div
            key={i}
            onClick={() => togglePdf(pdf.name)}
            className={`p-3 border-b border-white/5 text-sm ${
              selectedPdfs.includes(pdf.name)
                ? "bg-violet-500/20"
                : ""
            }`}
          >
            {pdf.name}
          </div>
        ))}
      </div>
    )}
  </div>

  {/* DESKTOP SIDEBAR */}
  <aside className="w-[280px] border-r border-white/10 bg-white/5 backdrop-blur-xl p-6 hidden md:flex flex-col"></aside>