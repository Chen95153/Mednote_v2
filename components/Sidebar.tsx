import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MENU_DATA } from '../constants';
import { MenuItem, MenuCategory } from '../types';
import { Search, ChevronDown, ChevronRight, GripVertical, Check, Wind, HeartPulse, Activity, Microscope, Plus, Save } from 'lucide-react';

interface SidebarProps {
  onItemClick: (category: string, item: string) => void;
  customItems?: Record<string, string[]>;
  onAddCustomItem?: (category: string, item: string) => void;
}


// Define structure for sub-items that can include headers
type NestedItem = string | { type: 'header'; label: string };




const Sidebar: React.FC<SidebarProps> = ({ onItemClick, customItems = {}, onAddCustomItem }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const [l2SearchTerm, setL2SearchTerm] = useState('');
  const [l3SearchTerm, setL3SearchTerm] = useState('');

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<MenuCategory | null>(null);

  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number; right: number } | null>(null);
  const [adjustedFlyoutPos, setAdjustedFlyoutPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);

  const [hoveredSubItem, setHoveredSubItem] = useState<string | null>(null);
  const [subFlyoutPos, setSubFlyoutPos] = useState<{ top: number; left: number; right: number } | null>(null);
  const [adjustedSubFlyoutPos, setAdjustedSubFlyoutPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);

  const flyoutRef = useRef<HTMLDivElement>(null);
  const subFlyoutRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const l2SearchRef = useRef<HTMLInputElement>(null);
  const l3SearchRef = useRef<HTMLInputElement>(null);

  // States for Breathing Sound Grid
  const [selectedBreathingZones, setSelectedBreathingZones] = useState<string[]>([]);
  const [isBilateralBreathing, setIsBilateralBreathing] = useState(false);

  // States for Heart Sound (Murmur)
  const [murmurGrade, setMurmurGrade] = useState<string>('');
  const [selectedMurmurTiming, setSelectedMurmurTiming] = useState<string[]>([]);
  const [selectedMurmurLoc, setSelectedMurmurLoc] = useState<string>('');

  // States for Vital Signs
  const [vitals, setVitals] = useState({ T: '', P: '', R: '', BP: '', SpO2: '', GCS: '' });

  const [abdominalStage, setAbdominalStage] = useState<'zones' | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [isDiffuse, setIsDiffuse] = useState(false);
  const [pittingStage, setPittingStage] = useState<'details' | null>(null);
  const [pittingGrade, setPittingGrade] = useState<string>('');
  const [pittingLocation, setPittingLocation] = useState<string>('');

  // --- Add Custom Item States ---
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [addMenuFlyoutPos, setAddMenuFlyoutPos] = useState<{ top: number; left: number } | null>(null);
  const [addMenuHoveredL1, setAddMenuHoveredL1] = useState<string | null>(null);
  const [addMenuL2FlyoutPos, setAddMenuL2FlyoutPos] = useState<{ top: number; left: number } | null>(null);

  const [newCustomCategory, setNewCustomCategory] = useState<string>('');
  const [newCustomCategoryDisplay, setNewCustomCategoryDisplay] = useState('Select Category');
  const [newCustomItemName, setNewCustomItemName] = useState('');

  const addMenuButtonRef = useRef<HTMLButtonElement>(null);
  const addMenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const visibleCategories: MenuCategory[] = [
    'Vital Sign', 'Symptom', 'Disease', 'Medical Facility', 'Physical examination', 'Lab data', 'Culture / Gram stain', 'Image finding', 'Treatment'
  ];

  const abxCategories = [
    'Penicillins (青黴素類)', 'Cephalosporins (頭孢菌素類)', 'Carbapenems (碳青黴烯類)', 'Fluoroquinolones (氟奎諾酮類)', 'Aminoglycosides (胺基醣苷類)', 'Tetracyclines (四環黴素類)', 'Macrolides (巨環類)', 'Glycopeptides & Lipopeptides (糖肽類與脂肽類)', 'Other (其他抗生素)'
  ];

  const abxData: Record<string, NestedItem[]> = {
    'Penicillins (青黴素類)': ['Penicillin G Benzathine', 'Penicillin G Sodium', 'Oxacillin (IV)', 'Dicloxacillin (PO)', 'Ampicillin', 'Amoxicillin', 'Ampicillin + Sulbactam (Unasyn)', 'Amoxicillin + Clavulanate (Augmentin)', 'Amoxicillin + Clavulanate (Curam)', 'Piperacillin + Tazobactam (Tazocin)', 'Ticarcillin + Clavulanate (Timentin)'],
    'Cephalosporins (頭孢菌素類)': [{ type: 'header', label: '-- 第一代 --' }, 'Cefazolin (IV)', 'Cephalexin (PO)', { type: 'header', label: '-- 第二代 --' }, 'Cefuroxime (Zinacef - IV)', 'Cefuroxime (Ceflour - PO)', { type: 'header', label: '-- 第二代 (Cephamycins) --' }, 'Cefmetazole', 'Cefoxitin', { type: 'header', label: '-- 2.5代 --' }, 'Flomoxef (Flumarin)', { type: 'header', label: '-- 第三代 --' }, 'Ceftriaxone (Rocephin)', 'Cefotaxime (Claforan/Loforan)', 'Cefixime (PO)', 'Ceftazidime (Fortum)', { type: 'header', label: '-- 3.5代 --' }, 'Cefoperazone + Sulbactam (Brosym)', { type: 'header', label: '-- 第四代 --' }, 'Cefepime (Maxipime)', { type: 'header', label: '-- 第五代 --' }, 'Ceftobiprole (Zeftera)', 'Ceftaroline (Zinforo)', { type: 'header', label: '-- 新型 --' }, 'Cefiderocol', 'Ceftazidime + Avibactam (Zavicefta)'],
    'Carbapenems (碳青黴烯類)': ['Ertapenem (Invanz)', 'Imipenem (Tienam)', 'Meropenem (Mepem)', 'Doripenem (Finibax)'],
    'Fluoroquinolones (氟奎諾酮類)': ['Ciprofloxacin (Ciproxin)', 'Levofloxacin (Cravit)', 'Moxifloxacin (Avelox)', 'Gemifloxacin (Factive)', 'Nemonoxacin'],
    'Aminoglycosides (胺基醣苷類)': ['Gentamicin', 'Amikacin', 'Streptomycin'],
    'Tetracyclines (四環黴素類)': ['Tetracycline', 'Doxycycline', 'Minocycline', 'Tigecycline (Tygacil)', 'Eravacycline'],
    'Macrolides (巨環類)': ['Erythromycin', 'Clarithromycin (Klaricid)', 'Azithromycin (Zithromax)'],
    'Glycopeptides & Lipopeptides (糖肽類與脂肽類)': ['Vancomycin', 'Teicoplanin (Targocid)', 'Daptomycin (Cubicicin)'],
    'Other (其他抗生素)': ['Linezolid (Zyvox)', 'Metronidazole (Flagyl)', 'TMP-SMX (Baktar)', 'TMP-SMX (Sevatrim)', 'Colistin (Colimycin)', 'Clindamycin (Clincin)', 'Rifampin', 'Fosfomycin', 'Fusidic acid (Fucidin)', 'Monobactam (Aztreonam)']
  };

  // --- Dynamic Data Merging ---
  const mergeList = (baseList: string[], key: string) => {
    const custom = customItems[key] || [];
    if (custom.length === 0) return baseList;
    const existing = new Set(baseList);
    return [...baseList, ...custom.filter(i => !existing.has(i))].sort((a, b) => a.localeCompare(b));
  };

  const mergedAbxData = useMemo(() => {
    const merged: Record<string, NestedItem[]> = { ...abxData };
    Object.keys(abxData).forEach(cat => {
      const customForCat = customItems[cat] || [];
      if (customForCat.length > 0) {
        const existingLabels = new Set(merged[cat].map(i => typeof i === 'string' ? i : i.label));
        const toAdd = customForCat.filter(i => !existingLabels.has(i));
        merged[cat] = [...merged[cat], ...toAdd];
      }
    });
    return merged;
  }, [abxData, customItems]);

  const cultureOrganismsBase = [
    'Acinetobacter baumannii', 'Acinetobacter spp.', 'Actinomyces', 'Aeromonas hydrophila', 'Aggregatibacter actinomycetemcomitans', 'Alcaligenes', 'Aspergillus fumigatus',
    'Bacillus anthracis', 'Bacillus cereus', 'Bacillus spp.', 'Bacteroides fragilis', 'Bartonella henselae', 'Bordetella pertussis', 'Borrelia burgdorferi', 'Borrelia recurrentis',
    'Brucella melitensis', 'Burkholderia cepacia complex', 'Burkholderia pseudomallei', 'Campylobacter coli', 'Campylobacter jejuni', 'Candida albicans', 'Candida spp.',
    'Capnocytophaga canimorsus', 'Cardiobacterium hominis', 'Chlamydia pneumoniae', 'Chlamydia trachomatis', 'Chlamydophila psittaci', 'Citrobacter', 'Clostridium botulinum',
    'Clostridium difficile (also known as Clostridioides difficile)', 'Clostridium perfringens', 'Clostridium septicum', 'Clostridium sordellii', 'Clostridium tetani',
    'Corynebacterium diphtheriae', 'Corynebacterium spp.', 'Coxiella burnetii', 'Cryptococcus', 'Eikenella corrodens', 'Enterobacter cloacae', 'Enterobacter spp.',
    'Enterococcus faecalis', 'Enterococcus faecium', 'Enterococcus spp.', 'Erysipelothrix rhusiopathiae', 'Escherichia coli (E. coli)', 'Francisella tularensis', 'Fusobacterium',
    'Gardnerella vaginalis', 'Haemophilus ducreyi', 'Haemophilus influenzae', 'Helicobacter pylori', 'Kingella kingae', 'Klebsiella pneumoniae', 'Klebsiella spp.', 'Lactobacillus',
    'Legionella pneumophila', 'Leptospira interrogans', 'Listeria monocytogenes', 'Micrococci species', 'Moraxella catarrhalis', 'Morganella', 'Mycobacterium abscessus',
    'Mycobacterium africanum', 'Mycobacterium avium complex (MAC)', 'Mycobacterium bovis', 'Mycobacterium canettii', 'Mycobacterium caprae', 'Mycobacterium chelonae',
    'Mycobacterium fortuitum', 'Mycobacterium gordonae', 'Mycobacterium haemophilum', 'Mycobacterium kansasii', 'Mycobacterium leprae', 'Mycobacterium lepromatosis',
    'Mycobacterium malmoense', 'Mycobacterium marinum', 'Mycobacterium microti', 'Mycobacterium orygis', 'Mycobacterium scrofulaceum', 'Mycobacterium tuberculosis',
    'Mycobacterium ulcerans', 'Mycobacterium xenopi', 'Mycoplasma genitalium', 'Mycoplasma pneumoniae', 'Neisseria gonorrhoeae', 'Neisseria meningitidis', 'Nocardia',
    'Orientia tsutsugamushi', 'Pasteurella multocida', 'Peptostreptococcus', 'Pneumocystis jirovecii', 'Prevotella', 'Proteus mirabilis', 'Proteus spp.', 'Providencia',
    'Providencia stuartii', 'Pseudomonas aeruginosa', 'Rickettsia prowazekii', 'Rickettsia rickettsii', 'Rickettsia typhi', 'Salmonella enteritidis', 'Salmonella paratyphi',
    'Salmonella typhi', 'Salmonella typhimurium', 'Schistosoma spp.', 'Serratia marcescens', 'Shigella dysenteriae', 'Staphylococcus aureus', 'Staphylococcus epidermidis',
    'Staphylococcus saprophyticus', 'Stenotrophomonas maltophilia', 'Streptococcus agalactiae (Group B Streptococcus)', 'Streptococcus bovis', 'Streptococcus dysgalactiae',
    'Streptococcus mutans', 'Streptococcus pneumoniae', 'Streptococcus pyogenes (Group A Streptococcus)', 'Streptococcus viridans', 'Treponema pallidum', 'Trichomonas vaginalis',
    'Ureaplasma urealyticum', 'Vibrio cholerae', 'Vibrio parahaemolyticus', 'Vibrio vulnificus', 'Yersinia enterocolitica', 'Yersinia pestis'
  ];

  const mergedCultureOrganisms = useMemo(() => mergeList(cultureOrganismsBase, 'Culture'), [cultureOrganismsBase, customItems]);

  const gramStainResultsBase = [
    'No organisms seen',
    'GPC: Gram-positive cocci in clusters',
    'GPC: Gram-positive cocci in chains',
    'GPC: Gram-positive cocci in pairs',
    'GNB: Gram-negative bacilli',
    'Yeast-like',
    'GPB (Gram-positive bacilli / rods)',
    'GNC (Gram-negative cocci)',
    'GVC (Gram-variable cocci/bacilli)'
  ];

  const mergedGramStain = useMemo(() => mergeList(gramStainResultsBase, 'Gram stain'), [gramStainResultsBase, customItems]);

  const breathingSoundsBase = [
    'Crackles (Rales) - Coarse',
    'Crackles (Rales) - Fine',
    'Stridor',
    'Wheezes',
    'Rhonchi',
    'Pleural Friction Rub'
  ];

  const mergedBreathingSounds = useMemo(() => mergeList(breathingSoundsBase, 'Breathing sound'), [breathingSoundsBase, customItems]);




  const lungZones = [
    { id: 'RUL', label: 'RUL', col: 'Right', row: 'Upper' },
    { id: 'LUL', label: 'LUL', col: 'Left', row: 'Upper' },
    { id: 'RML', label: 'RML', col: 'Right', row: 'Middle' },
    { id: 'LML', label: 'LML', col: 'Left', row: 'Middle' },
    { id: 'RLL', label: 'RLL', col: 'Right', row: 'Lower' },
    { id: 'LLL', label: 'LLL', col: 'Left', row: 'Lower' },
  ];

  const abdominalQuadrants = ['LUQ', 'RUQ', 'LLQ', 'RLQ'];
  const abdominalRegions = ['Right Hypochondriac Region', 'Epigastric Region', 'Left Hypochondriac Region', 'Right Lumbar / Flank Region', 'Umbilical Region', 'Left Lumbar / Flank Region', 'Right Iliac / Inguinal Fossa', 'Hypogastric / Suprapubic Region', 'Left Iliac / Inguinal Fossa'];

  // Default set to empty array so all menus are collapsed initially
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const startCloseTimer = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setHoveredItem(null);
      setHoveredSubItem(null);
      resetSubStates();
    }, 150);
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (hoveredItem && l2SearchRef.current) l2SearchRef.current.focus();
  }, [hoveredItem]);

  useEffect(() => {
    if ((hoveredSubItem || abdominalStage) && l3SearchRef.current) l3SearchRef.current.focus();
  }, [hoveredSubItem, abdominalStage]);

  useLayoutEffect(() => {
    if (flyoutPos && flyoutRef.current) {
      const rect = flyoutRef.current.getBoundingClientRect();
      const padding = 16;
      let { top, left } = flyoutPos;
      if (top + rect.height > window.innerHeight - padding) top = Math.max(padding, window.innerHeight - rect.height - padding);
      if (left + rect.width > window.innerWidth - padding) left = Math.max(padding, window.innerWidth - rect.width - padding);
      setAdjustedFlyoutPos({ top, left, width: rect.width, maxHeight: window.innerHeight - top - padding });
    }
  }, [flyoutPos, hoveredItem]);

  useLayoutEffect(() => {
    if (subFlyoutPos && subFlyoutRef.current) {
      const rect = subFlyoutRef.current.getBoundingClientRect();
      const padding = 16;
      let { top, left } = subFlyoutPos;
      if (top + rect.height > window.innerHeight - padding) top = Math.max(padding, window.innerHeight - rect.height - padding);
      if (adjustedFlyoutPos && (left + rect.width > window.innerWidth - padding)) {
        left = Math.max(padding, adjustedFlyoutPos.left - rect.width - 4);
      }
      setAdjustedSubFlyoutPos({ top, left, width: rect.width, maxHeight: window.innerHeight - top - padding });
    }
  }, [subFlyoutPos, adjustedFlyoutPos, hoveredSubItem, abdominalStage]);

  const resetSubStates = () => {
    setSelectedZones([]);
    setIsDiffuse(false);
    setAbdominalStage(null);
    setPittingStage(null);
    setPittingGrade('');
    setPittingLocation('');
    setL2SearchTerm('');
    setL3SearchTerm('');
    setSelectedBreathingZones([]);
    setIsBilateralBreathing(false);
    setMurmurGrade('');
    setSelectedMurmurTiming([]);
    setSelectedMurmurLoc('');
  };

  const handleMouseEnterItem = (e: React.MouseEvent, item: string, category: MenuCategory) => {
    clearCloseTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredItem(item);
    setHoveredCategory(category);
    setL2SearchTerm('');
    setFlyoutPos({ top: rect.top, left: rect.right + 4, right: rect.right });
    if (hoveredItem !== item) {
      setHoveredSubItem(null);
      resetSubStates();
    }
  };

  const handleMouseEnterSubItem = (e: React.MouseEvent, sub: string) => {
    clearCloseTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredSubItem(sub);
    setL3SearchTerm('');
    setSubFlyoutPos({ top: rect.top, left: rect.right + 4, right: rect.right });
  };

  const toggleBreathingZone = (zoneId: string) => {
    setIsBilateralBreathing(false);
    setSelectedBreathingZones(prev =>
      prev.includes(zoneId) ? prev.filter(z => z !== zoneId) : [...prev, zoneId]
    );
  };

  const handleInsertBreathing = () => {
    const loc = isBilateralBreathing ? 'Bilateral' : selectedBreathingZones.join(', ');
    if (loc) {
      onItemClick('Physical examination', `${hoveredSubItem} at ${loc}`);
    } else {
      onItemClick('Physical examination', hoveredSubItem!);
    }
    setHoveredItem(null);
    resetSubStates();
  };

  const handleInsertMurmur = () => {
    const intensity = murmurGrade ? `Grade ${murmurGrade}/6` : '';
    const timing = selectedMurmurTiming.length > 0 ? selectedMurmurTiming.join(', ') : '';
    const location = selectedMurmurLoc ? `at ${selectedMurmurLoc}` : '';
    const parts = [intensity, timing, location].filter(Boolean);
    const final = `Murmur: ${parts.join(' ')}`;
    onItemClick('Physical examination', final);
    setHoveredItem(null);
    resetSubStates();
  };

  const handleInsertVitals = () => {
    const parts = [];
    if (vitals.T) parts.push(`T: ${vitals.T} C`);
    if (vitals.P) parts.push(`P: ${vitals.P} bpm`);
    if (vitals.R) parts.push(`R: ${vitals.R} /min`);
    if (vitals.BP) parts.push(`BP: ${vitals.BP} mmHg`);
    if (vitals.SpO2) parts.push(`SpO2: ${vitals.SpO2} %`);
    if (vitals.GCS) parts.push(`GCS: ${vitals.GCS}`);

    if (parts.length > 0) {
      onItemClick('Vital Sign', parts.join(', '));
      setVitals({ T: '', P: '', R: '', BP: '', SpO2: '', GCS: '' });
      setHoveredItem(null);
      resetSubStates();
    }
  };

  const handleMouseEnterYes = (e: React.MouseEvent, stage: 'zones' | 'details') => {
    clearCloseTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    if (stage === 'zones') {
      setSubFlyoutPos({ top: rect.top, left: rect.right + 4, right: rect.right });
      setAbdominalStage('zones');
      setL3SearchTerm('');
    } else {
      setSubFlyoutPos({ top: rect.top, left: rect.right + 4, right: rect.right });
      setPittingStage('details');
      setL3SearchTerm('');
    }
  };

  const toggleZone = (zoneId: string) => {
    setSelectedZones(prev => prev.includes(zoneId) ? prev.filter(z => z !== zoneId) : [...prev, zoneId]);
    setIsDiffuse(false);
  };

  const fuzzyFilter = <T extends string | NestedItem>(items: T[], term: string): T[] => {
    if (!term) return items;
    const lowerTerm = term.toLowerCase();
    return items.filter(item => {
      const label = typeof item === 'string' ? item : item.label;
      return label.toLowerCase().includes(lowerTerm);
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 overflow-visible relative">
      <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10 flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Menu Source</h2>
          <div className="relative">
            <input type="text" placeholder="Search categories..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          </div>
        </div>

        {/* Add Custom Item Toggle Section */}
        <div className="border-t border-slate-100 pt-3">
          <button
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-tight"
          >
            {showAddCustom ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
            Add Custom Item
          </button>

          {showAddCustom && (
            <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
              <button
                ref={addMenuButtonRef}
                onClick={() => {
                  if (addMenuButtonRef.current) {
                    const rect = addMenuButtonRef.current.getBoundingClientRect();
                    setAddMenuFlyoutPos(prev => prev ? null : { top: rect.bottom + 4, left: rect.left });
                  }
                }}
                className="w-full px-3 py-2 text-xs text-left font-semibold bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700 flex justify-between items-center"
              >
                <span className="truncate">{newCustomCategoryDisplay}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Item Name"
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCustomItemName}
                  onChange={(e) => setNewCustomItemName(e.target.value)}
                />
                <button
                  disabled={!newCustomCategory || !newCustomItemName.trim()}
                  onClick={() => {
                    if (onAddCustomItem && newCustomCategory && newCustomItemName.trim()) {
                      onAddCustomItem(newCustomCategory, newCustomItemName.trim());
                      setNewCustomItemName('');
                      // Optional: Feedback?
                    }
                  }}
                  className="px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {MENU_DATA.map((group) => {
          if (!visibleCategories.includes(group.category)) return null;
          const filteredItems = group.items.filter(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
          if (searchTerm && filteredItems.length === 0) return null;
          const isExpanded = expandedCategories.includes(group.category);
          const colorClass = group.category === 'Vital Sign' ? 'text-green-600 hover:bg-green-50' :
            group.category === 'Medical Facility' ? 'text-blue-600 hover:bg-blue-50' :
              group.category === 'Culture / Gram stain' ? 'text-cyan-600 hover:bg-cyan-50' :
                group.category === 'Lab data' ? 'text-orange-600 hover:bg-orange-50' : 'text-slate-600 hover:bg-slate-100';

          return (
            <div key={group.category} className="mb-2">
              <button onClick={() => setExpandedCategories(prev => prev.includes(group.category) ? prev.filter(c => c !== group.category) : [...prev, group.category])} className={`w-full flex items-center px-2 py-2 text-sm font-semibold rounded-md transition-colors ${colorClass}`}>
                {isExpanded ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                {group.category}
              </button>
              {isExpanded && (
                <div className="pl-4 mt-1 space-y-1">
                  {filteredItems.map((item) => {
                    const hasFlyout = (
                      group.category === 'Vital Sign' ||
                      group.category === 'Symptom' ||
                      group.category === 'Disease' ||
                      group.category === 'Medical Facility' ||
                      group.category === 'Physical examination' ||
                      group.category === 'Culture / Gram stain' ||
                      (group.category === 'Treatment' && item === 'Antibiotics')
                    );
                    return (
                      <div key={item}
                        onMouseEnter={(e) => hasFlyout && handleMouseEnterItem(e, item, group.category)}
                        onMouseLeave={startCloseTimer}
                        onClick={() => !hasFlyout && onItemClick(group.category, item)}
                        className={`group relative flex items-center justify-between px-3 py-2 text-sm text-slate-700 bg-white border rounded-md transition-all active:scale-95 cursor-pointer ${hoveredItem === item ? 'border-blue-400 bg-blue-50/30 shadow-sm' : 'border-slate-200 hover:border-blue-400 hover:shadow-sm'}`}
                      >
                        <span className="truncate">{item}</span>
                        {hasFlyout ? <ChevronRight className={`w-3 h-3 ${hoveredItem === item ? 'opacity-100' : 'text-slate-300 opacity-60 group-hover:opacity-100'}`} /> : <GripVertical className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hoveredItem && flyoutPos && createPortal(
        <div
          ref={flyoutRef}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={startCloseTimer}
          className="fixed z-[9999] bg-white border border-slate-200 rounded-lg shadow-2xl animate-in fade-in slide-in-from-left-1 duration-150 min-w-[220px] max-w-[340px] overflow-hidden flex flex-col"
          style={{
            top: adjustedFlyoutPos?.top ?? flyoutPos.top,
            left: adjustedFlyoutPos?.left ?? flyoutPos.left,
            maxHeight: adjustedFlyoutPos?.maxHeight ?? '80vh'
          }}
        >
          {/* Header for searchable flyouts */}
          {hoveredCategory !== 'Vital Sign' && hoveredCategory !== 'Medical Facility' && (
            <div className="p-2 bg-slate-50 border-b flex-shrink-0">
              <div className="relative">
                <input ref={l2SearchRef} type="text" placeholder="Search..." className="w-full pl-8 pr-3 py-1 text-xs border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-500" value={l2SearchTerm} onChange={(e) => setL2SearchTerm(e.target.value)} />
                <Search className="absolute left-2.5 top-1.5 text-slate-400 w-3.5 h-3.5" />
              </div>
            </div>
          )}

          <div className="overflow-y-auto custom-scrollbar flex-1 py-1">
            {/* Medical Facility Flyout */}
            {hoveredCategory === 'Medical Facility' && ['Emergency Department', 'Outpatient Department'].map(dept => (
              <button
                key={dept}
                onClick={() => {
                  // Strip Chinese characters and their parentheses
                  const cleanName = hoveredItem!.replace(/\s*\(.*?\)/, '');
                  onItemClick('Medical Facility', `the ${dept} of ${cleanName}`);
                  setHoveredItem(null);
                  resetSubStates();
                }}
                className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-blue-50 text-blue-700 transition-colors border-b border-slate-50 last:border-0"
              >
                {dept}
              </button>
            ))}

            {/* Culture / Gram stain Flyout */}
            {hoveredCategory === 'Culture / Gram stain' && fuzzyFilter(['Culture', 'Gram stain'], l2SearchTerm).map(opt => (
              <div
                key={opt}
                onMouseEnter={(e) => handleMouseEnterSubItem(e, opt)}
                className={`px-4 py-3 text-sm font-semibold flex items-center justify-between cursor-pointer border-b last:border-0 transition-colors ${hoveredSubItem === opt ? 'bg-cyan-50 text-cyan-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                {opt}
                <ChevronRight className="w-3 h-3" />
              </div>
            ))}

            {/* Vital Sign Flyout (Input Form) */}
            {hoveredCategory === 'Vital Sign' && hoveredItem === 'Vital sign' && (
              <div className="p-4 w-72 space-y-4">
                <div className="flex items-center space-x-2 text-green-600 mb-2 font-bold text-xs uppercase tracking-wider">
                  <Activity className="w-4 h-4" />
                  <span>Vital Sign Entry</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">T (°C)</label>
                    <input type="text" placeholder="37.0" className="w-full p-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-green-500 outline-none" value={vitals.T} onChange={(e) => setVitals({ ...vitals, T: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">P (bpm)</label>
                    <input type="text" placeholder="80" className="w-full p-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-green-500 outline-none" value={vitals.P} onChange={(e) => setVitals({ ...vitals, P: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">R (/min)</label>
                    <input type="text" placeholder="18" className="w-full p-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-green-500 outline-none" value={vitals.R} onChange={(e) => setVitals({ ...vitals, R: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">SpO2 (%)</label>
                    <input type="text" placeholder="98" className="w-full p-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-green-500 outline-none" value={vitals.SpO2} onChange={(e) => setVitals({ ...vitals, SpO2: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">BP (mmHg)</label>
                  <input type="text" placeholder="120/80" className="w-full p-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-green-500 outline-none" value={vitals.BP} onChange={(e) => setVitals({ ...vitals, BP: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">GCS</label>
                  <input type="text" placeholder="E4V5M6" className="w-full p-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-green-500 outline-none" value={vitals.GCS} onChange={(e) => setVitals({ ...vitals, GCS: e.target.value })} />
                </div>

                <button onClick={handleInsertVitals} className="w-full py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all">Insert Vital Signs</button>
              </div>
            )}

            {/* Symptom Flyout */}
            {hoveredCategory === 'Symptom' && fuzzyFilter(['Positive', 'Negative'], l2SearchTerm).map(opt => (
              <button key={opt} onClick={() => { onItemClick(opt === 'Positive' ? 'Symptom' : 'Negative Symptom', hoveredItem!); setHoveredItem(null); resetSubStates(); }} className={`w-full px-4 py-3 text-left text-sm font-semibold transition-colors border-b border-slate-50 last:border-0 ${opt === 'Positive' ? 'hover:bg-blue-50 text-blue-700' : 'hover:bg-red-50 text-red-700'}`}>{opt}</button>
            ))}

            {/* Disease Flyout */}
            {hoveredCategory === 'Disease' && fuzzyFilter(['Tentative Diagnosis', 'Underlying Disease', 'Definitive Disease'], l2SearchTerm).map(opt => (
              <button key={opt} onClick={() => { const targetCategory = opt === 'Underlying Disease' ? 'Underlying disease' : opt === 'Definitive Disease' ? 'Definitive diagnosis' : opt; onItemClick(targetCategory, hoveredItem!); setHoveredItem(null); resetSubStates(); }} className="w-full px-4 py-3 text-left text-sm font-semibold transition-colors border-b border-slate-50 last:border-0 hover:bg-indigo-50 text-indigo-700">{opt}</button>
            ))}

            {/* Breathing Sound Sub-items */}
            {hoveredCategory === 'Physical examination' && hoveredItem === 'Breathing sound' && fuzzyFilter(mergedBreathingSounds, l2SearchTerm).map(sub => (
              <div key={sub} onMouseEnter={(e) => handleMouseEnterSubItem(e, sub)} className={`px-4 py-3 text-sm font-semibold flex items-center justify-between cursor-pointer border-b last:border-0 transition-colors ${hoveredSubItem === sub ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}>{sub}<ChevronRight className="w-3 h-3" /></div>
            ))}

            {/* Heart Sound Sub-items */}
            {hoveredCategory === 'Physical examination' && hoveredItem === 'Heart sound' && fuzzyFilter(['Heart Beats', 'Murmur'], l2SearchTerm).map(sub => (
              <div key={sub} onMouseEnter={(e) => handleMouseEnterSubItem(e, sub)} className={`px-4 py-3 text-sm font-semibold flex items-center justify-between cursor-pointer border-b last:border-0 transition-colors ${hoveredSubItem === sub ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}>{sub}<ChevronRight className="w-3 h-3" /></div>
            ))}

            {/* Treatment/Antibiotics */}
            {hoveredCategory === 'Treatment' && hoveredItem === 'Antibiotics' && fuzzyFilter(abxCategories, l2SearchTerm).map(cls => (
              <div key={cls} onMouseEnter={(e) => handleMouseEnterSubItem(e, cls)} className={`px-4 py-3 text-sm font-semibold flex items-center justify-between cursor-pointer border-b last:border-0 transition-colors ${hoveredSubItem === cls ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}>{cls}<ChevronRight className="w-3 h-3" /></div>
            ))}

            {/* Other Exam Flyouts */}
            {hoveredCategory === 'Physical examination' && (hoveredItem === 'Abdominal tenderness' || hoveredItem === 'Rebound tenderness' || hoveredItem === 'Muscle guarding' || hoveredItem === 'Knocking pain') && fuzzyFilter(['Yes', 'No'], l2SearchTerm).map(choice => (
              <button key={choice} onMouseEnter={(e) => choice === 'Yes' ? handleMouseEnterYes(e, 'zones') : undefined} onClick={() => choice === 'No' && (onItemClick('Physical examination', `No ${hoveredItem}`), setHoveredItem(null), resetSubStates())} className={`w-full px-4 py-3 text-left text-sm font-semibold flex justify-between items-center transition-colors border-b last:border-0 ${choice === 'Yes' && abdominalStage ? 'bg-green-50 text-green-700' : 'hover:bg-slate-50'}`}>{choice} {choice === 'Yes' && <ChevronRight className="w-4 h-4" />}</button>
            ))}
            {hoveredCategory === 'Physical examination' && hoveredItem === 'Pitting edema' && fuzzyFilter(['Yes', 'No'], l2SearchTerm).map(choice => (
              <button key={choice} onMouseEnter={(e) => choice === 'Yes' ? handleMouseEnterYes(e, 'details') : undefined} onClick={() => choice === 'No' && (onItemClick('Physical examination', 'No pitting edema'), setHoveredItem(null), resetSubStates())} className={`w-full px-4 py-3 text-left text-sm font-semibold flex justify-between items-center transition-colors border-b last:border-0 ${choice === 'Yes' && pittingStage ? 'bg-green-50 text-green-700' : 'hover:bg-slate-50'}`}>{choice} {choice === 'Yes' && <ChevronRight className="w-4 h-4" />}</button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Nested Flyout (Layer 3) */}
      {(hoveredSubItem || abdominalStage || pittingStage) && subFlyoutPos && createPortal(
        <div
          ref={subFlyoutRef}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={startCloseTimer}
          className="fixed z-[10000] bg-white border border-slate-200 rounded-lg shadow-2xl animate-in fade-in slide-in-from-left-2 duration-200 min-w-[260px] max-w-[420px] overflow-hidden flex flex-col"
          style={{
            top: adjustedSubFlyoutPos?.top ?? subFlyoutPos.top,
            left: adjustedSubFlyoutPos?.left ?? subFlyoutPos.left,
            maxHeight: adjustedSubFlyoutPos?.maxHeight ?? '80vh'
          }}
        >
          <div className="p-2 bg-slate-50 border-b flex-shrink-0">
            <div className="relative">
              <input ref={l3SearchRef} type="text" placeholder="Search..." className="w-full pl-8 pr-3 py-1 text-xs border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-500" value={l3SearchTerm} onChange={(e) => setL3SearchTerm(e.target.value)} />
              <Search className="absolute left-2.5 top-1.5 text-slate-400 w-3.5 h-3.5" />
            </div>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 py-1">
            {/* Culture / Gram stain Layer 3 */}
            {hoveredCategory === 'Culture / Gram stain' && hoveredSubItem === 'Culture' && fuzzyFilter(mergedCultureOrganisms, l3SearchTerm).map(org => (
              <button key={org} onClick={() => { onItemClick('Lab data', `${hoveredItem} Culture: ${org}`); setHoveredItem(null); resetSubStates(); }} className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-cyan-50 hover:text-cyan-700 transition-colors border-b border-slate-50 last:border-0">{org}</button>
            ))}
            {hoveredCategory === 'Culture / Gram stain' && hoveredSubItem === 'Gram stain' && fuzzyFilter(mergedGramStain, l3SearchTerm).map(stain => (
              <button key={stain} onClick={() => { onItemClick('Lab data', `${hoveredItem} Gram stain: ${stain}`); setHoveredItem(null); resetSubStates(); }} className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-cyan-50 hover:text-cyan-700 transition-colors border-b border-slate-50 last:border-0">{stain}</button>
            ))}

            {/* Breathing Sound Zone Selector Grid */}
            {hoveredCategory === 'Physical examination' && hoveredItem === 'Breathing sound' && (
              <div className="p-4 w-64 space-y-4">
                <div className="flex items-center space-x-2 text-blue-600 mb-2 font-bold text-xs uppercase tracking-wider"><Wind className="w-4 h-4" /><span>Zone Selector</span></div>
                <button onClick={() => { setIsBilateralBreathing(!isBilateralBreathing); setSelectedBreathingZones([]); }} className={`w-full py-2.5 rounded-lg text-sm font-bold border-2 transition-all ${isBilateralBreathing ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50'}`}>Bilateral</button>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-[10px] font-bold text-slate-400 text-center uppercase py-1 bg-slate-50 rounded">Right</div>
                  <div className="text-[10px] font-bold text-slate-400 text-center uppercase py-1 bg-slate-50 rounded">Left</div>
                  {lungZones.map(z => (<button key={z.id} onClick={() => toggleBreathingZone(z.id)} className={`py-3 text-xs font-bold border-2 rounded-lg transition-all ${selectedBreathingZones.includes(z.id) ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'}`}>{z.label}</button>))}
                </div>
                <button onClick={handleInsertBreathing} className="w-full py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all">Insert Findings</button>
              </div>
            )}

            {/* Heart Beats (Layer 3) */}
            {hoveredCategory === 'Physical examination' && hoveredSubItem === 'Heart Beats' && fuzzyFilter(['regular', 'irregular'], l3SearchTerm).map(opt => (
              <button key={opt} onClick={() => { onItemClick('Physical examination', `Heart Beats: ${opt}`); setHoveredItem(null); resetSubStates(); }} className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-slate-50 last:border-0">{opt}</button>
            ))}

            {/* Murmur Selector (Layer 3) */}
            {hoveredCategory === 'Physical examination' && hoveredSubItem === 'Murmur' && (
              <div className="p-4 w-72 space-y-4">
                <div className="flex items-center space-x-2 text-indigo-600 mb-2 font-bold text-xs uppercase tracking-wider"><HeartPulse className="w-4 h-4" /><span>Murmur Detail</span></div>
                <section><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Intensity (Grade 1-6)</label>
                  <div className="grid grid-cols-6 gap-1">{[1, 2, 3, 4, 5, 6].map(g => (<button key={g} onClick={() => setMurmurGrade(g.toString())} className={`py-1.5 text-xs font-bold border-2 rounded-md transition-all ${murmurGrade === g.toString() ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-indigo-50 border-slate-100'}`}>{g}</button>))}</div>
                </section>
                <section><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Timing</label>
                  <div className="grid grid-cols-2 gap-2"><div className="text-[9px] font-bold text-slate-300 text-center uppercase">Early</div><div className="text-[9px] font-bold text-slate-300 text-center uppercase">Late</div>
                    {['Systolic', 'Diastolic'].map(row => (
                      <React.Fragment key={row}>
                        {['Early', 'Late'].map(col => {
                          const id = `${col} ${row}`; const isSelected = selectedMurmurTiming.includes(id);
                          return (<button key={id} onClick={() => setSelectedMurmurTiming(prev => isSelected ? prev.filter(t => t !== id) : [...prev, id])} className={`py-2 text-[10px] font-bold border-2 rounded-lg transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100'}`}>{id}</button>);
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </section>
                <section><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Location</label>
                  <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto p-1 border border-slate-100 rounded-lg bg-slate-50/50">
                    {['Aortic Area', 'Pulmonic Area', 'Tricuspid Area', 'Mitral Area, Apex'].map(loc => (<button key={loc} onClick={() => setSelectedMurmurLoc(loc)} className={`px-3 py-1.5 text-left text-[11px] font-semibold rounded-md transition-colors ${selectedMurmurLoc === loc ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-white'}`}>{loc}</button>))}
                  </div>
                </section>
                <button onClick={handleInsertMurmur} className="w-full py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all">Insert Murmur</button>
              </div>
            )}

            {/* Antibiotics Sub-list */}
            {hoveredCategory === 'Treatment' && hoveredSubItem && abxData[hoveredSubItem] && fuzzyFilter(abxData[hoveredSubItem], l3SearchTerm).map((item, idx) => {
              if (typeof item !== 'string' && item.type === 'header') { return <div key={`h-${idx}`} className="px-4 py-1.5 bg-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-tight">{item.label}</div>; }
              const label = typeof item === 'string' ? item : item.label;
              return (<button key={label} onClick={() => { onItemClick('Treatment', label); setHoveredItem(null); resetSubStates(); }} className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-slate-50 last:border-0">{label}</button>);
            })}

            {abdominalStage === 'zones' && (
              <div className="p-4 w-72 space-y-4">
                <button onClick={() => { setIsDiffuse(!isDiffuse); setSelectedZones([]); }} className={`w-full py-2.5 rounded-lg text-sm font-bold border-2 transition-all ${isDiffuse ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50'}`}>Diffuse</button>
                <section><label className="text-[10px] font-bold text-slate-400 uppercase mb-2">Quadrants</label><div className="grid grid-cols-2 gap-2">{fuzzyFilter(abdominalQuadrants, l3SearchTerm).map(q => (<button key={q} onClick={() => toggleZone(q)} className={`py-2 text-xs font-bold border-2 rounded-lg transition-all ${selectedZones.includes(q) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100'}`}>{q}</button>))}</div></section>
                <section className="pt-2 border-t border-slate-100"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Regions</label><div className="grid grid-cols-3 gap-1">{fuzzyFilter(abdominalRegions, l3SearchTerm).map((r) => (<button key={r} onClick={() => toggleZone(r)} className={`p-1 text-[8px] leading-tight font-bold border-2 rounded-md h-12 flex items-center justify-center text-center ${selectedZones.includes(r) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100'}`}>{r.replace(' Region', '').replace(' / ', '\n')}</button>))}</div></section>
                <button onClick={() => { const result = isDiffuse ? `${hoveredItem}: diffuse` : (selectedZones.length > 0 ? `${hoveredItem} at ${selectedZones.join(', ')}` : ''); if (result) { onItemClick('Physical examination', result); setHoveredItem(null); resetSubStates(); } }} disabled={!isDiffuse && selectedZones.length === 0} className={`w-full py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${(!isDiffuse && selectedZones.length === 0) ? 'bg-slate-200 text-slate-400' : 'bg-green-600 text-white hover:bg-green-700'}`}>Insert Findings</button>
              </div>
            )}

            {pittingStage === 'details' && (
              <div className="p-5 w-60 space-y-5">
                <section><label className="block text-[10px] font-bold text-slate-400 uppercase mb-3">Grade</label><div className="grid grid-cols-4 gap-1.5">{fuzzyFilter(['1+', '2+', '3+', '4+'], l3SearchTerm).map(g => (<button key={g} onClick={() => setPittingGrade(g)} className={`py-2 text-xs font-bold border-2 rounded-lg transition-all ${pittingGrade === g ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-blue-50'}`}>{g}</button>))}</div></section>
                <section><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Location</label><input type="text" placeholder="e.g. Bilateral lower limbs" className="w-full p-2.5 text-xs border-2 border-slate-100 rounded-lg outline-none focus:border-blue-400" value={pittingLocation} onChange={(e) => setPittingLocation(e.target.value)} /></section>
                <button onClick={() => { const gradeStr = pittingGrade ? `Grade ${pittingGrade}` : ''; const locStr = pittingLocation ? `at ${pittingLocation}` : ''; onItemClick('Physical examination', `Pitting edema: ${[gradeStr, locStr].filter(Boolean).join(' ')}`); setHoveredItem(null); resetSubStates(); }} className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-green-700 transition-all">Insert</button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* --- ADD CUSTOM ITEM CASCADE MENUS (Separate Portals) --- */}
      {showAddCustom && addMenuFlyoutPos && createPortal(
        <div
          className="fixed z-[10000] bg-white border border-slate-200 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100 min-w-[200px] overflow-hidden flex flex-col pointer-events-auto"
          style={{
            top: addMenuFlyoutPos.top,
            left: addMenuFlyoutPos.left,
            maxHeight: '60vh'
          }}
          onMouseLeave={() => {
            if (!addMenuL2FlyoutPos) {
              setAddMenuFlyoutPos(null);
              setAddMenuHoveredL1(null);
            }
          }}
        >
          <div className="p-2 bg-slate-50 border-b text-[10px] font-bold text-slate-400 uppercase text-center">Select Category</div>
          <div className="overflow-y-auto custom-scrollbar flex-1 py-1">
            {visibleCategories.map(cat => {
              let hasSub = false;
              const menuDataItems = MENU_DATA.find(m => m.category === cat)?.items || [];

              if (cat === 'Culture / Gram stain') hasSub = true;
              else if (cat === 'Treatment') hasSub = true;
              else if (cat === 'Physical examination') hasSub = true;
              else if (menuDataItems.length > 0 && cat !== 'Vital Sign' && cat !== 'Symptom' && cat !== 'Negative Symptom') {
                if (cat === 'Disease') hasSub = false;
                else if (cat === 'Medical Facility') hasSub = false;
                else hasSub = false;
              }

              return (
                <div
                  key={cat}
                  onMouseEnter={(e) => {
                    setAddMenuHoveredL1(cat);
                    if (hasSub) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setAddMenuL2FlyoutPos({ top: rect.top, left: rect.right + 2 });
                    } else {
                      setAddMenuL2FlyoutPos(null);
                    }
                  }}
                  onClick={() => {
                    setNewCustomCategory(cat);
                    setNewCustomCategoryDisplay(cat);
                    setAddMenuFlyoutPos(null);
                  }}
                  className={`px-4 py-2 text-xs font-semibold cursor-pointer flex justify-between items-center transition-colors ${addMenuHoveredL1 === cat ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {cat}
                  {hasSub && <ChevronRight className="w-3 h-3 text-slate-400" />}
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}

      {showAddCustom && addMenuL2FlyoutPos && addMenuHoveredL1 && (
        createPortal(
          <div
            className="fixed z-[10001] bg-white border border-slate-200 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100 min-w-[200px] flex flex-col pointer-events-auto"
            style={{
              top: addMenuL2FlyoutPos.top,
              left: addMenuL2FlyoutPos.left,
              maxHeight: '60vh'
            }}
            onMouseLeave={() => {
              setAddMenuL2FlyoutPos(null);
              setAddMenuHoveredL1(null);
              setAddMenuFlyoutPos(null);
            }}
          >
            <div className="p-2 bg-slate-50 border-b text-[10px] font-bold text-slate-400 uppercase text-center">{addMenuHoveredL1} Sub-type</div>
            <div className="overflow-y-auto custom-scrollbar flex-1 py-1">
              {(() => {
                let subItems: (string | { label: string; hasSub: boolean; targetKey?: string })[] = [];

                if (addMenuHoveredL1 === 'Culture / Gram stain') {
                  subItems = [{ label: 'Culture', hasSub: false, targetKey: 'Culture' }, { label: 'Gram stain', hasSub: false, targetKey: 'Gram stain' }];
                } else if (addMenuHoveredL1 === 'Treatment') {
                  const items = MENU_DATA.find(m => m.category === 'Treatment')?.items || [];
                  subItems = items.map(i => ({
                    label: i,
                    hasSub: i === 'Antibiotics',
                    targetKey: i
                  }));
                } else if (addMenuHoveredL1 === 'Physical examination') {
                  const items = MENU_DATA.find(m => m.category === 'Physical examination')?.items || [];
                  subItems = items.map(i => ({ label: i, hasSub: false, targetKey: i }));
                }

                return subItems.map(subItem => {
                  const label = typeof subItem === 'string' ? subItem : subItem.label;
                  const hasSub = typeof subItem === 'string' ? false : subItem.hasSub;
                  const targetKey = typeof subItem === 'string' ? subItem : (subItem.targetKey || label);

                  return (
                    <div
                      key={label}
                      className={`px-4 py-2 text-xs font-semibold cursor-pointer flex justify-between items-center transition-colors hover:bg-blue-50 hover:text-blue-700 group`}
                      onClick={() => {
                        setNewCustomCategory(targetKey);
                        setNewCustomCategoryDisplay(`${addMenuHoveredL1} > ${label}`);
                        setAddMenuFlyoutPos(null);
                        setAddMenuL2FlyoutPos(null);
                      }}
                    >
                      {label}
                      {hasSub && <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />}

                      {hasSub && label === 'Antibiotics' && (
                        <div className="hidden group-hover:block absolute left-full top-0 w-64 bg-white border border-slate-200 rounded-lg shadow-xl ml-1 max-h-[60vh] overflow-y-auto">
                          {abxCategories.map(abxCat => (
                            <button
                              key={abxCat}
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewCustomCategory(abxCat);
                                setNewCustomCategoryDisplay(abxCat);
                                setAddMenuFlyoutPos(null);
                                setAddMenuL2FlyoutPos(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 border-b border-slate-50 last:border-0"
                            >
                              {abxCat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  );
};

export default Sidebar;
