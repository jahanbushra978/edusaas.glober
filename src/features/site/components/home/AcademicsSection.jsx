import { useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";

const DEFAULT_PROGRAMS = (t) => {
  const baseTheme = {
    grad: "linear-gradient(135deg,#004D2A,#006241)", 
    accent: "#D4AF37",
  };
  return [
    {
      icon: "📖", title: t.programs.noorani.title, desc: t.programs.noorani.desc,
      ...baseTheme,
    },
    {
      icon: "📔", title: t.programs.nazera.title, desc: t.programs.nazera.desc,
      ...baseTheme,
    },
    {
      icon: "📕", title: t.programs.hifz.title, desc: t.programs.hifz.desc,
      ...baseTheme,
    },
    {
      icon: "📙", title: t.programs.shunani.title, desc: t.programs.shunani.desc,
      ...baseTheme,
    },
    {
      icon: "📓", title: t.programs.kg.title, desc: t.programs.kg.desc,
      ...baseTheme,
    },
    {
      icon: "📜", title: t.programs.kitab.title, desc: t.programs.kitab.desc,
      ...baseTheme,
    },
    {
      icon: "📚", title: t.programs.general.title, desc: t.programs.general.desc,
      ...baseTheme,
    },
  ];
};

export default function AcademicsSection({ sectionData: propSectionData }) {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const trans = t.academicsSection;
  const isAr = lang === "ar";

  const { data: fetchedSectionData } = useQuery({
    queryKey: ["page-section-academics"],
    queryFn: () => appClient.entities.PageSection.filter({ section_key: "academics" }),
    select: d => d[0],
    enabled: propSectionData === undefined,
  });

  const sectionData = propSectionData || fetchedSectionData;

  const programs = useMemo(() => {
    if (sectionData?.items_json) {
      try {
        const customItems = JSON.parse(sectionData.items_json);
        return customItems.map(item => ({
          ...item,
          title: lang === 'bn' ? item.titleBn : lang === 'ar' ? (item.titleAr || item.titleEn) : item.titleEn,
          desc: lang === 'bn' ? item.descBn : lang === 'ar' ? (item.descAr || item.descEn) : item.descEn
        }));
      } catch {}
    }
    return DEFAULT_PROGRAMS(trans);
  }, [sectionData, trans, lang]);

  if (sectionData?.is_visible === false) return null;

  return null;
}

