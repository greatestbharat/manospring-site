import React, { useState, useEffect } from 'react';
import { Specialist } from '../../types';
import { SpecialistCard } from './SpecialistCard';
import { specialistService } from '../../services/specialist.service';
import { useTranslation } from '../../app/i18n';

interface SpecialistGridProps {
  specialists?: Specialist[];
  loading?: boolean;
  onBookSpecialist?: (specialist: Specialist) => void;
  onBook?: (specialist: Specialist) => void;
  onViewBio?: (specialist: Specialist) => void;
}

export const SpecialistGrid: React.FC<SpecialistGridProps> = ({
  specialists: propSpecialists,
  loading: propLoading,
  onBookSpecialist,
  onBook,
  onViewBio
}) => {
  const [localSpecialists, setLocalSpecialists] = useState<Specialist[]>([]);
  const [localLoading, setLocalLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<'all' | 'psychiatrist' | 'psychologist' | 'cbt'>('all');
  const [search, setSearch] = useState('');
  const { t } = useTranslation();

  // Fallback booking handler supporting both props
  const handleBook = (spec: Specialist) => {
    if (onBookSpecialist) {
      onBookSpecialist(spec);
    } else if (onBook) {
      onBook(spec);
    }
  };

  useEffect(() => {
    if (propSpecialists && propSpecialists.length > 0) {
      setLocalSpecialists(propSpecialists);
      setLocalLoading(false);
      return;
    }

    let isMounted = true;
    specialistService.getSpecialists()
      .then((data) => {
        if (isMounted) {
          setLocalSpecialists(Array.isArray(data) ? data : []);
          setLocalLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLocalSpecialists([]);
          setLocalLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propSpecialists]);

  const activeSpecialists = propSpecialists !== undefined ? propSpecialists : localSpecialists;
  const isLoading = propLoading !== undefined ? propLoading : localLoading;

  const safeList = Array.isArray(activeSpecialists) ? activeSpecialists : [];

  const filteredSpecialists = safeList.filter(doc => {
    if (!doc) return false;
    const title = (doc.title || doc.role || '').toLowerCase();
    const name = (doc.name || '').toLowerCase();
    const specialties = Array.isArray(doc.specialties) ? doc.specialties : [];

    const matchesCategory =
      category === 'all' ||
      title.includes(category) ||
      specialties.some(s => typeof s === 'string' && s.toLowerCase().includes(category));

    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      name.includes(query) ||
      title.includes(query) ||
      specialties.some(s => typeof s === 'string' && s.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-20 bg-white dark:bg-[#0a120f] transition-colors duration-200" id="specialists">
      <div className="wrap space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="inline-flex items-center px-3.5 py-1 bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 rounded-full text-xs font-semibold border border-teal-200 dark:border-teal-850">
            {t('specialists.badge', 'Verified Professionals')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-slate-900 dark:text-white">
            {t('specialists.title', 'Care from people who truly listen.')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t('specialists.subtitle', 'Consult licensed psychiatrists and clinical psychologists verified with the National Medical Commission (NMC) and Rehabilitation Council of India (RCI).')}
          </p>
        </div>

        {/* Clean, Streamlined Segment Filter Bar */}
        <div className="bg-slate-50 dark:bg-[#13221d] border border-slate-200 dark:border-slate-800 rounded-full p-1.5 max-w-2xl mx-auto shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                category === 'all'
                  ? 'bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-teal-800 dark:hover:text-teal-300'
              }`}
            >
              {t('specialists.all', 'All')}
            </button>
            <button
              type="button"
              onClick={() => setCategory('psychiatrist')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                category === 'psychiatrist'
                  ? 'bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-teal-800 dark:hover:text-teal-300'
              }`}
            >
              {t('specialists.psychiatrists', 'Psychiatrists')}
            </button>
            <button
              type="button"
              onClick={() => setCategory('psychologist')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                category === 'psychologist'
                  ? 'bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-teal-800 dark:hover:text-teal-300'
              }`}
            >
              {t('specialists.psychologists', 'Clinical Psychologists')}
            </button>
            <button
              type="button"
              onClick={() => setCategory('cbt')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                category === 'cbt'
                  ? 'bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-teal-800 dark:hover:text-teal-300'
              }`}
            >
              {t('specialists.therapy', 'Therapy & CBT')}
            </button>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('specialists.searchPlaceholder', 'Search doctor or condition...')}
            className="px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none bg-transparent min-w-[170px]"
          />
        </div>

        {/* Directory Grid */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">
            {t('specialists.retrieving', 'Retrieving verified clinicians...')}
          </div>
        ) : filteredSpecialists.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-[#13221d] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg mx-auto space-y-3 p-8">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">{t('specialists.noMatchTitle', 'No specialists match your filter')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('specialists.noMatchDesc', 'Try choosing "All" or searching for another specialty.')}</p>
            <button
              type="button"
              onClick={() => { setCategory('all'); setSearch(''); }}
              className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-full text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              {t('specialists.resetFilters', 'Reset Filters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpecialists.map(specialist => (
              <SpecialistCard
                key={specialist.id}
                specialist={specialist}
                onBook={handleBook}
                onViewBio={(spec) => onViewBio && onViewBio(spec)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
