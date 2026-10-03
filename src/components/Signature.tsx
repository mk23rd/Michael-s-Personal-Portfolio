import { profile } from "@/data/portfolio";
import { useEthiopianDate } from "@/hooks/use-ethiopian-date";
import { cn, vars } from "@/lib/utils";

/**
 * A hand-drawn sign-off that writes itself in when it scrolls into view (the strokes are drawn with
 * stroke-dashoffset, so reduced motion simply shows them finished), beside a rubber stamp of the name in Ge'ez.
 */
const Signature = ({ className }: { className?: string }) => {
  const { year } = useEthiopianDate(profile.timeZone);

  return (
    <div
      className={cn("signature", className)}
      role="img"
      aria-label={`Signed, ${profile.name.split(" ")[0]} (${profile.nameAm}), ${profile.city}`}
      data-reveal
    >
      <svg viewBox="0 0 270 96" className="signature-ink" aria-hidden="true">
        {/* M */}
        <path
          pathLength={1}
          style={vars({ "--i": 0 })}
          d="M10 70 C 16 52, 22 28, 28 14 C 31 32, 34 50, 38 62 C 42 44, 48 26, 55 13 C 57 32, 59 52, 63 66"
        />
        {/* ichael, in one breath */}
        <path
          pathLength={1}
          style={vars({ "--i": 1 })}
          d="M63 66 C 67 58, 70 51, 74 46 C 74 54, 74 60, 79 64 C 85 61, 90 53, 93 47 C 87 44, 82 56, 88 64 C 94 67, 101 61, 105 54 C 109 40, 115 17, 113 10 C 108 14, 106 40, 108 64 C 110 54, 116 46, 122 48 C 126 52, 124 60, 129 64 C 135 62, 139 54, 137 48 C 131 46, 127 60, 135 64 C 141 64, 143 54, 143 48 C 143 56, 145 62, 151 62 C 157 60, 163 54, 161 48 C 155 46, 151 58, 157 64 C 163 66, 169 60, 173 54 C 179 40, 185 16, 181 10 C 175 16, 175 46, 181 64 C 187 68, 197 63, 206 56"
        />
        {/* the dot on the i */}
        <path pathLength={1} style={vars({ "--i": 2 })} d="M74 35 l 3 -3" />
        {/* the swash underneath */}
        <path pathLength={1} style={vars({ "--i": 3 })} d="M18 84 C 80 75, 170 72, 256 62" />
      </svg>

      <span className="stamp" aria-hidden="true">
        <span lang="am" className="stamp-name">
          {profile.nameAm}
        </span>
        <span className="stamp-meta">
          {profile.city} · {year}
        </span>
      </span>
    </div>
  );
};

export default Signature;
