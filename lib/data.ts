export type DocumentType = 'Resumen' | 'Examen' | 'Examen Resuelto' | 'Trabajo Práctico' | 'Guía de Ejercicios';

export interface NoteRating {
  uid: string;
  userName: string;
  value: number;
}

export interface Note {
  id: string;
  title: string;
  author: string;
  uploadDate: string;
  type: DocumentType;
  fileSize?: string;
  fileType?: 'PDF' | 'DOCX' | 'ZIP';
  status?: 'pending' | 'approved' | 'rejected';
  fileUrl?: string;
  upvotes?: number;
  downvotes?: number;
  ratings?: NoteRating[];
  careerId?: string;
  subjectId?: string;
  year?: number;
  folderName?: string | null;
  priority?: number;
  downloadCount?: number;
}

export interface Subject {
  isElectiva?: boolean;
  id: string;
  name: string;
  year: number;
  careerId: string;
  notesCount: number;
  notes: Note[];
  isElective?: boolean;
  excludedCareers?: string[];
  careerPaths?: { careerId: string; year: number }[];
}

export interface Career {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  pastelBg: string;
  pastelText: string;
  pastelBorder: string;
  pastelAccent: string;
  implemented: boolean;
  maxYears: number;
}

export const careersData: Career[] = [
  {
    id: 'basicas', name: 'Ciclo Común (Básicas)', shortName: 'Básicas',
    description: 'Materias comunes a todas las ingenierías: Matemática, Física, Química y más.',
    icon: 'BookMarked', pastelBg: 'bg-[#F5EFE5]', pastelText: 'text-[#8B7355]', pastelBorder: 'border-[#E2D6C2]', pastelAccent: 'bg-gradient-to-r from-[#C4A87D] to-[#B8976A]',
    implemented: true, maxYears: 2,
  },
  {
    id: 'sistemas', name: 'Ingeniería en Sistemas de Información', shortName: 'Sistemas',
    description: 'Diseño, desarrollo y gestión de software y proyectos tecnológicos.',
    icon: 'Monitor', pastelBg: 'bg-[#E8F0EA]', pastelText: 'text-[#4A7A52]', pastelBorder: 'border-[#C5DBC9]', pastelAccent: 'bg-gradient-to-r from-[#8BAA91] to-[#7CC2A8]',
    implemented: true, maxYears: 5,
  },
  {
    id: 'electronica', name: 'Ingeniería Electrónica', shortName: 'Electrónica',
    description: 'Circuitos, señales digitales y diseño de hardware.',
    icon: 'Cpu', pastelBg: 'bg-[#FFF0E5]', pastelText: 'text-[#9B6B3D]', pastelBorder: 'border-[#E8D4BF]', pastelAccent: 'bg-gradient-to-r from-[#E8A87C] to-[#C4A87D]',
    implemented: true, maxYears: 6,
  },
  {
    id: 'civil', name: 'Ingeniería Civil', shortName: 'Civil',
    description: 'Infraestructura, construcción y gestión de obras.',
    icon: 'Building2', pastelBg: 'bg-[#FAEAE4]', pastelText: 'text-[#9B5D44]', pastelBorder: 'border-[#E8CFC3]', pastelAccent: 'bg-gradient-to-r from-[#D4856A] to-[#C28B8B]',
    implemented: true, maxYears: 6,
  },
  {
    id: 'electromecanica', name: 'Ingeniería Electromecánica', shortName: 'Electromecánica',
    description: 'Sistemas eléctricos, mecánicos e industriales.',
    icon: 'Cog', pastelBg: 'bg-[#EFEBF5]', pastelText: 'text-[#6B5A8E]', pastelBorder: 'border-[#D5CCE5]', pastelAccent: 'bg-gradient-to-r from-[#9B8BBF] to-[#B4A7D6]',
    implemented: true, maxYears: 5,
  },
  {
    id: 'quimica', name: 'Ingeniería Química', shortName: 'Química',
    description: 'Procesos industriales, materiales y biotecnología.',
    icon: 'FlaskConical', pastelBg: 'bg-[#F5E8E8]', pastelText: 'text-[#8E5A5A]', pastelBorder: 'border-[#E2CECE]', pastelAccent: 'bg-gradient-to-r from-[#C28B8B] to-[#D4856A]',
    implemented: true, maxYears: 5,
  },
  {
    id: 'telecomunicaciones', name: 'Ingeniería en Telecomunicaciones', shortName: 'Telecomunicaciones',
    description: 'Redes convergentes, transmisión y sistemas de comunicación.',
    icon: 'Radio', pastelBg: 'bg-[#E5EFF5]', pastelText: 'text-[#4A6E82]', pastelBorder: 'border-[#C5D6E2]', pastelAccent: 'bg-gradient-to-r from-[#7BA7C2] to-[#5A8EAA]',
    implemented: true, maxYears: 5,
  },
];

const sub = (id: string, name: string, year: number, careerId: string): Subject => ({
  id, name, year, careerId, notesCount: 0, notes: []
});

const ele = (id: string, name: string, year: number, careerId: string, careerPaths?: { careerId: string; year: number }[]): Subject => ({
  id, name, year, careerId, notesCount: 0, notes: [], isElective: true, careerPaths
});

// ============================================================
// MATERIAS ELECTIVAS COMPARTIDAS
// ============================================================
const sharedElectives: Subject[] = [
  ele('ele-fe', 'Formación de Emprendedores', 99, 'basicas', [
    { careerId: 'sistemas', year: 99 },
    { careerId: 'electronica', year: 99 },
    { careerId: 'civil', year: 99 },
    { careerId: 'electromecanica', year: 99 },
    { careerId: 'quimica', year: 99 },
    { careerId: 'telecomunicaciones', year: 99 }
  ]),
  ele('ele-cl', 'Comunicación Lingüística', 99, 'basicas', [
    { careerId: 'sistemas', year: 99 },
    { careerId: 'electronica', year: 99 },
    { careerId: 'civil', year: 99 },
    { careerId: 'electromecanica', year: 99 },
    { careerId: 'quimica', year: 99 },
    { careerId: 'telecomunicaciones', year: 99 }
  ]),
  ele('ele-epi', 'Epistemología de las Ciencias de la Ingeniería', 99, 'basicas', [
    { careerId: 'sistemas', year: 99 },
    { careerId: 'electronica', year: 99 },
    { careerId: 'civil', year: 99 },
    { careerId: 'electromecanica', year: 99 },
    { careerId: 'quimica', year: 99 },
    { careerId: 'telecomunicaciones', year: 99 }
  ]),
  ele('ele-mc', 'Metodología de la Ciencia', 99, 'basicas', [
    { careerId: 'sistemas', year: 99 },
    { careerId: 'electronica', year: 99 },
    { careerId: 'civil', year: 99 },
    { careerId: 'electromecanica', year: 99 },
    { careerId: 'quimica', year: 99 },
    { careerId: 'telecomunicaciones', year: 99 }
  ])
];

// ============================================================
// INGENIERÍA EN SISTEMAS DE INFORMACIÓN
// ============================================================
const sistemasSubs: Subject[] = [
  // 1er Año
  sub('sis-led', 'Lógica y Estructuras Discretas', 1, 'sistemas'),
  sub('sis-aed', 'Algoritmos y Estructuras de Datos', 1, 'sistemas'),
  sub('sis-arq', 'Arquitectura de Computadoras', 1, 'sistemas'),
  sub('sis-spn', 'Sistemas y Procesos de Negocio', 1, 'sistemas'),
  // 2do Año
  sub('sis-asi', 'Análisis de Sistemas de Información', 2, 'sistemas'),
  sub('sis-ssl', 'Sintaxis y Semántica de los Lenguajes', 2, 'sistemas'),
  sub('sis-pdp', 'Paradigmas de Programación', 2, 'sistemas'),
  sub('sis-so', 'Sistemas Operativos', 2, 'sistemas'),
  // 3er Año
  sub('sis-dsi', 'Diseño de Sistemas de Información', 3, 'sistemas'),
  sub('sis-bd', 'Bases de Datos', 3, 'sistemas'),
  sub('sis-cdd', 'Comunicación de Datos', 3, 'sistemas'),
  sub('sis-ds', 'Desarrollo de Software', 3, 'sistemas'),
  sub('sis-an', 'Análisis Numérico', 3, 'sistemas'),
  
  // 4to Año
  sub('sis-si', 'Seminario Integrador', 4, 'sistemas'),
  sub('sis-asi4', 'Administración de Sistemas de Información', 4, 'sistemas'),
  sub('sis-ics', 'Ingeniería y Calidad de Software', 4, 'sistemas'),
  sub('sis-io', 'Investigación Operativa', 4, 'sistemas'),
  sub('sis-sim', 'Simulación', 4, 'sistemas'),
  sub('sis-red', 'Redes de Datos', 4, 'sistemas'),
  sub('sis-tpa', 'Tecnología para la Automatización', 4, 'sistemas'),
  
  // 5to Año
  sub('sis-pf', 'Proyecto Final', 5, 'sistemas'),
  sub('sis-sdg', 'Sistemas de Gestión', 5, 'sistemas'),
  sub('sis-ssi', 'Seguridad en los Sistemas de Información', 5, 'sistemas'),
  sub('sis-ia', 'Inteligencia Artificial', 5, 'sistemas'),
  sub('sis-cd', 'Ciencia de Datos', 5, 'sistemas'),
  

  // Materias Electivas (Sistemas)
  ele('sis-ele-aprendizaje-de-maquinas', 'Aprendizaje de Máquinas', 99, 'sistemas'),
  ele('sis-ele-programacion-avanzada', 'Programación Avanzada', 99, 'sistemas'),
  ele('sis-ele-seguridad-en-redes', 'Seguridad en Redes', 99, 'sistemas'),
  ele('sis-ele-taller-de-programacion-avanzada', 'Taller de Programación Avanzada', 99, 'sistemas'),
  ele('sis-ele-informatica-industrial', 'Informática Industrial', 99, 'sistemas'),
  ele('sis-ele-administracion-de-proyectos', 'Administración de Proyectos', 99, 'sistemas'),
  ele('sis-ele-base-de-datos-avanzadas', 'Base de Datos Avanzadas', 99, 'sistemas'),
  ele('sis-ele-desarrollo-de-software-dirigido-por-modelos', 'Desarrollo de Software Dirigido por Modelos', 99, 'sistemas'),
  ele('sis-ele-gobierno-digital-e-innovacion', 'Gobierno Digital e Innovación', 99, 'sistemas'),
  ele('sis-ele-arquitectura-de-microservicios', 'Arquitectura de Microservicios', 99, 'sistemas'),
  ele('sis-ele-redes-neuronales-profundas', 'Redes Neuronales Profundas', 99, 'sistemas'),
  ele('sis-ele-administracion-de-servicios-en-linux', 'Administración de Servicios en Linux', 99, 'sistemas'),
  ele('sis-ele-computacion-paralela', 'Computación Paralela', 99, 'sistemas'),
  ele('sis-ele-evaluacion-e-innovacion-de-tecnologia-desde-la-perspectiva-cts', 'Evaluación e Innovación de Tecnología desde la perspectiva CTS', 99, 'sistemas'),
  ele('sis-ele-diseno-de-experiencia-de-usuario-ux', 'Diseño de Experiencia de Usuario (UX)', 99, 'sistemas'),
  ele('sis-ele-taller-de-auditoria-en-sistemas-de-informacion', 'Taller de Auditoría en Sistemas de Información', 99, 'sistemas'),
  ele('sis-ele-interoperabilidad', 'Interoperabilidad', 99, 'sistemas'),
  ele('sis-ele-formacion-de-emprendedores', 'Formación de Emprendedores', 99, 'sistemas'),
];

// ============================================================
// INGENIERÍA CIVIL
// ============================================================
const civilSubs: Subject[] = [
  // 1er Año
  sub('civ-ic1', 'Ingeniería Civil I', 1, 'civil'),
  sub('civ-sr', 'Sistemas de Representación', 1, 'civil'),
  sub('civ-fi', 'Fundamentos de Informática', 1, 'civil'),
  // 2do Año
  sub('civ-ic2', 'Ingeniería Civil II', 2, 'civil'),
  sub('civ-tm', 'Tecnología de los Materiales', 2, 'civil'),
  sub('civ-est', 'Estabilidad', 2, 'civil'),
  // 3er Año
  sub('civ-rm', 'Resistencia de Materiales', 3, 'civil'),
  sub('civ-tc', 'Tecnología de la Construcción', 3, 'civil'),
  sub('civ-hga', 'Hidráulica General y Aplicada', 3, 'civil'),
  sub('civ-th', 'Tecnología del Hormigón', 3, 'civil'),
  sub('civ-iea', 'Instalaciones Eléctricas Acústicas', 3, 'civil'),
  sub('civ-itm', 'Instalaciones Termomecánicas', 3, 'civil'),
  sub('civ-gtp', 'Geotopografía', 3, 'civil'),
  sub('civ-ca', 'Cálculo Avanzado', 3, 'civil'),
  // 4to Año
  sub('civ-dapu', 'Diseño Arquitectónico, Planeamiento y Urbanismo', 4, 'civil'),
  sub('civ-hoh', 'Hidrología y Obras Hidráulicas', 4, 'civil'),
  sub('civ-isg', 'Instalaciones Sanitarias y Gas', 4, 'civil'),
  sub('civ-ae1', 'Análisis Estructural I', 4, 'civil'),
  sub('civ-gt', 'Geotecnia', 4, 'civil'),
  sub('civ-eh', 'Estructuras de Hormigón', 4, 'civil'),
  sub('civ-il', 'Ingeniería Legal', 4, 'civil'),
  // 5to Año
  sub('civ-oco', 'Organización y Conducción de Obras', 5, 'civil'),
  sub('civ-cim', 'Cimentaciones', 5, 'civil'),
  sub('civ-is', 'Ingeniería Sanitaria', 5, 'civil'),
  sub('civ-vc1', 'Vías de Comunicación I', 5, 'civil'),
  sub('civ-gads', 'Gestión Ambiental y Desarrollo Sustentable', 5, 'civil'),
  sub('civ-cmm', 'Construcciones Metálicas y de Madera', 5, 'civil'),
  sub('civ-ae2', 'Análisis Estructural II', 5, 'civil'),
  sub('civ-vc2', 'Vías de Comunicación II', 5, 'civil'),
  // 6to Año
  sub('civ-pf', 'Proyecto Final', 6, 'civil'),
  

  // Materias Electivas (Civil)
  ele('civ-ele-geologia-aplicada', 'Geología Aplicada', 99, 'civil'),
  ele('civ-ele-sustentabilidad-del-recurso-hidrico', 'Sustentabilidad del Recurso Hídrico', 99, 'civil'),
  ele('civ-ele-ferrocarriles', 'Ferrocarriles', 99, 'civil'),
  ele('civ-ele-transito-y-transporte', 'Tránsito y Transporte', 99, 'civil'),
  ele('civ-ele-prefabricacion', 'Prefabricación', 99, 'civil'),
  ele('civ-ele-diseno-estructural', 'Diseño Estructural', 99, 'civil'),
  ele('civ-ele-gestion-ingenieril', 'Gestión Ingenieril', 99, 'civil'),
  ele('civ-ele-dinamica-de-estructuras', 'Dinámica de Estructuras', 99, 'civil'),
  ele('civ-ele-analisis-estructural-iii', 'Análisis Estructural III', 99, 'civil'),
  ele('civ-ele-saneamiento-y-medio-ambiente', 'Saneamiento y Medio Ambiente', 99, 'civil'),
  ele('civ-ele-vialidad-especial', 'Vialidad Especial', 99, 'civil'),
  ele('civ-ele-caminos-y-tuneles-de-montanas', 'Caminos y Túneles de Montañas', 99, 'civil'),
  ele('civ-ele-obras-fluviales-y-costeras', 'Obras Fluviales y Costeras', 99, 'civil'),
  ele('civ-ele-centrales-y-maquinas-hidraulicas', 'Centrales y Máquinas Hidráulicas', 99, 'civil'),
  ele('civ-ele-puentes', 'Puentes', 99, 'civil'),
  ele('civ-ele-diseno-sustentable-de-edificios', 'Diseño Sustentable de Edificios', 99, 'civil'),
];

// ============================================================
// INGENIERÍA QUÍMICA
// ============================================================
const quimicaSubs: Subject[] = [
  // 1er Año
  sub('qui-iiq', 'Introducción a la Ingeniería Química', 1, 'quimica'),
  sub('qui-sr', 'Sistemas de representación', 1, 'quimica'),
  // 2do Año
  sub('qui-iep', 'Introducción a Equipos y Procesos', 2, 'quimica'),
  sub('qui-qo', 'Química Orgánica', 2, 'quimica'),
  sub('qui-qi', 'Química Inorgánica', 2, 'quimica'),
  sub('qui-fi', 'Fundamentos de Informática', 2, 'quimica'),
  // 3er Año
  sub('qui-bme', 'Balances de Masa y Energía', 3, 'quimica'),
  sub('qui-td', 'Termodinámica', 3, 'quimica'),
  sub('qui-msa', 'Matemática Superior Aplicada', 3, 'quimica'),
  sub('qui-qa', 'Química Analítica', 3, 'quimica'),
  sub('qui-mqb', 'Microbiología y Química Biológica', 3, 'quimica'),
  sub('qui-cm', 'Ciencia de los Materiales', 3, 'quimica'),
  sub('qui-fq', 'Fisicoquímica', 3, 'quimica'),
  sub('qui-ft', 'Fenómenos de Transporte', 3, 'quimica'),
  sub('qui-qaa', 'Química Analítica Aplicada', 3, 'quimica'),
  // 4to Año
  sub('qui-dsop', 'Diseño, simulación, optimización y seguridad de procesos', 4, 'quimica'),
  sub('qui-ou1', 'Operaciones Unitarias I', 4, 'quimica'),
  sub('qui-irq', 'Ingeniería de las Reacciones Químicas', 4, 'quimica'),
  sub('qui-tet', 'Tecnología de la Energía Térmica', 4, 'quimica'),
  sub('qui-ccep', 'Calidad y Control Estadístico de Procesos', 4, 'quimica'),
  sub('qui-ou2', 'Operaciones Unitarias II', 4, 'quimica'),
  sub('qui-oi', 'Organización Industrial', 4, 'quimica'),
  // 5to Año
  sub('qui-cap', 'Control Automático de Procesos', 5, 'quimica'),
  sub('qui-pf', 'Proyecto Final', 5, 'quimica'),
  sub('qui-ia', 'Ingeniería Ambiental', 5, 'quimica'),
  sub('qui-mi', 'Mecánica Industrial', 5, 'quimica'),
  sub('qui-pb', 'Procesos Biotecnológicos', 5, 'quimica'),
  sub('qui-hst', 'Higiene y Seguridad en el Trabajo', 5, 'quimica'),
  sub('qui-mie', 'Máquinas e Instalaciones Eléctricas', 5, 'quimica'),
  

  // Materias Electivas (Química)
  ele('qui-ele-epistemologia', 'Epistemología', 99, 'quimica'),
  ele('qui-ele-metodologia-de-la-investigacion', 'Metodología de la Investigación', 99, 'quimica'),
  ele('qui-ele-utilitarios-de-computacion', 'Utilitarios de Computación', 99, 'quimica'),
  ele('qui-ele-gestion-de-rrhh', 'Gestión de RRHH', 99, 'quimica'),
  ele('qui-ele-analisis-del-ciclo-de-vida-acv', 'Análisis del Ciclo de Vida (ACV)', 99, 'quimica'),
  ele('qui-ele-instalaciones-de-maq-termicas-y-fluidodinamicas', 'Instalaciones de Maq. térmicas y fluidodinámicas', 99, 'quimica'),
  ele('qui-ele-industrializacion-de-hidrocarburos', 'Industrialización de Hidrocarburos', 99, 'quimica'),
  ele('qui-ele-gestion-empresarial-i', 'Gestión Empresarial I', 99, 'quimica'),
  ele('qui-ele-bioquimica-de-los-alimentos', 'Bioquímica de los Alimentos', 99, 'quimica'),
  ele('qui-ele-ind-alimentarias', 'Ind. Alimentarias', 99, 'quimica'),
  ele('qui-ele-ind-de-base-extractiva-ext-fracc-ref', 'Ind. de Base Extractiva - Ext., Fracc., Ref.', 99, 'quimica'),
  ele('qui-ele-evaluacion-de-impacto-ambiental', 'Evaluación de Impacto Ambiental', 99, 'quimica'),
  ele('qui-ele-gestion-empresarial-ii', 'Gestión Empresarial II', 99, 'quimica'),
  ele('qui-ele-ing-industrial-de-recursos-naturales-regionales', 'Ing. Industrial de Recursos Naturales Regionales', 99, 'quimica'),
  ele('qui-ele-formacion-de-emprendedores', 'Formación de Emprendedores', 99, 'quimica'),
];

// ============================================================
// INGENIERÍA ELECTRÓNICA
// ============================================================
const electronicaSubs: Subject[] = [
  // 1er Año
  sub('ele-inf1', 'Informática I', 1, 'electronica'),
  sub('ele-dac', 'Diseño asistido por computadora', 1, 'electronica'),
  // 2do Año
  sub('ele-inf2', 'Informática II', 2, 'electronica'),
  sub('ele-ass', 'Análisis de Señales y Sistemas', 2, 'electronica'),
  sub('ele-fe', 'Física Electrónica', 2, 'electronica'),
  // 3er Año
  sub('ele-tc1', 'Teoría de los Circuitos I', 3, 'electronica'),
  sub('ele-td1', 'Técnicas Digitales I', 3, 'electronica'),
  sub('ele-de', 'Dispositivos Electrónicos', 3, 'electronica'),
  sub('ele-ea1', 'Electrónica Aplicada I', 3, 'electronica'),
  sub('ele-me', 'Medios de Enlace', 3, 'electronica'),
  // 4to Año
  sub('ele-td2', 'Técnicas Digitales II', 4, 'electronica'),
  sub('ele-me1', 'Medidas Electrónicas I', 4, 'electronica'),
  sub('ele-tc2', 'Teoría de los Circuitos II', 4, 'electronica'),
  sub('ele-mie', 'Máquinas e Instalaciones Eléctricas', 4, 'electronica'),
  sub('ele-sc', 'Sistemas de Comunicaciones', 4, 'electronica'),
  sub('ele-ea2', 'Electrónica Aplicada II', 4, 'electronica'),
  sub('ele-shma', 'Seguridad, Higiene y Medio Ambiente', 4, 'electronica'),
  // 5to Año
  sub('ele-td3', 'Técnicas Digitales III', 5, 'electronica'),
  sub('ele-me2', 'Medidas Electrónicas II', 5, 'electronica'),
  sub('ele-sdc', 'Sistemas de Control', 5, 'electronica'),
  sub('ele-ea3', 'Electrónica Aplicada III', 5, 'electronica'),
  sub('ele-te', 'Tecnología Electrónica', 5, 'electronica'),
  sub('ele-ep', 'Electrónica de Potencia', 5, 'electronica'),
  sub('ele-oi', 'Organización Industrial', 5, 'electronica'),
  // 6to Año
  sub('ele-pf', 'Proyecto Final', 6, 'electronica'),
  

  // Materias Electivas (Electrónica)
  ele('ele-ele-redes-de-datos', 'Redes de Datos', 99, 'electronica'),
  ele('ele-ele-electronica-industrial', 'Electrónica Industrial', 99, 'electronica'),
  ele('ele-ele-sistemas-de-comunicaciones-ii', 'Sistemas de Comunicaciones II', 99, 'electronica'),
  ele('ele-ele-bioelectronica', 'Bioelectrónica', 99, 'electronica'),
  ele('ele-ele-introduccion-a-los-sist-de-gestion-gerencial', 'Introducción a los Sist. de Gestión Gerencial', 99, 'electronica'),
  ele('ele-ele-sistemas-de-tv', 'Sistemas de TV', 99, 'electronica'),
  ele('ele-ele-antenas-y-propagacion-electromagnetica', 'Antenas y Propagación Electromagnética', 99, 'electronica'),
  ele('ele-ele-centro-de-datos-diseno-y-administracion', 'Centro de Datos: Diseño y Administración', 99, 'electronica'),
  ele('ele-ele-sistemas-de-comunicaciones-iii', 'Sistemas de Comunicaciones III', 99, 'electronica'),
  ele('ele-ele-protecciones-digitales-y-telecontrol', 'Protecciones Digitales y Telecontrol', 99, 'electronica'),
  ele('ele-ele-redes-de-comunicaciones-moviles', 'Redes de Comunicaciones Móviles', 99, 'electronica'),
  ele('ele-ele-evaluacion-e-innovacion-de-tecnologia-desde-la-perspectiva-cts', 'Evaluación e Innovación de Tecnología desde la perspectiva CTS', 99, 'electronica'),
  ele('ele-ele-formacion-de-emprendedores', 'Formación de Emprendedores', 99, 'electronica'),
  ele('ele-ele-sistemas-de-sonido', 'Sistemas de Sonido', 99, 'electronica'),
  ele('ele-ele-robotica', 'Robótica', 99, 'electronica'),
  ele('ele-ele-electronica-automotriz', 'Electrónica Automotriz', 99, 'electronica'),
  ele('ele-ele-control-de-procesos', 'Control de Procesos', 99, 'electronica'),
  ele('ele-ele-teleinformatica-en-i-o-t', 'Teleinformática en I o T', 99, 'electronica'),
  ele('ele-ele-interoperabilidad', 'Interoperabilidad', 99, 'electronica'),
];

// ============================================================
// INGENIERÍA ELECTROMECÁNICA
// ============================================================
const electromecanicaSubs: Subject[] = [
  // 1er Año
  sub('elm-ie1', 'Ingeniería Electromecánica I', 1, 'electromecanica'),
  sub('elm-sr', 'Sistemas de Representación', 1, 'electromecanica'),
  sub('elm-rg', 'Representación Gráfica', 1, 'electromecanica'),
  // 2do Año
  sub('elm-ie2', 'Ingeniería Electromecánica II', 2, 'electromecanica'),
  sub('elm-est', 'Estabilidad', 2, 'electromecanica'),
  sub('elm-cm', 'Conocimiento de Materiales', 2, 'electromecanica'),
  sub('elm-pc', 'Programación en Computación', 2, 'electromecanica'),
  // 3er Año
  sub('elm-ie3', 'Ingeniería Electromecánica III', 3, 'electromecanica'),
  sub('elm-mm', 'Mecánica y Mecanísmos', 3, 'electromecanica'),
  sub('elm-et', 'Electrotecnia', 3, 'electromecanica'),
  sub('elm-tme', 'Tecnología Mecánica', 3, 'electromecanica'),
  sub('elm-tt', 'Termodinámica Técnica', 3, 'electromecanica'),
  sub('elm-mpe', 'Matemática para Ing. Electromecánica', 3, 'electromecanica'),
  sub('elm-hsi', 'Higiene y Seguridad Industrial', 3, 'electromecanica'),
  // 4to Año
  sub('elm-em', 'Elementos de Máquinas', 4, 'electromecanica'),
  sub('elm-mfmf', 'Mecánica de los Fluidos y Máquinas Fluidodinámicas', 4, 'electromecanica'),
  sub('elm-mt', 'Máquinas Térmicas', 4, 'electromecanica'),
  sub('elm-me', 'Máquinas Eléctricas', 4, 'electromecanica'),
  sub('elm-mel', 'Mediciones Eléctricas', 4, 'electromecanica'),
  sub('elm-ei', 'Electrónica Industrial', 4, 'electromecanica'),
  // 5to Año
  sub('elm-rdie', 'Redes de Distribución e Instalaciones Eléctricas', 5, 'electromecanica'),
  sub('elm-met', 'Máquinas y Equipos de Transporte', 5, 'electromecanica'),
  sub('elm-gme', 'Gestión y Mantenimiento Electromecánico', 5, 'electromecanica'),
  sub('elm-itm', 'Instalaciones Térmicas y Mecánicas', 5, 'electromecanica'),
  sub('elm-aci', 'Automatización y Control Industrial', 5, 'electromecanica'),
  sub('elm-cst', 'Centrales y Sistemas de Transmisión', 5, 'electromecanica'),
  sub('elm-oi', 'Organización Industrial', 5, 'electromecanica'),
  sub('elm-on', 'Oleohidráulica y Neumática', 5, 'electromecanica'),
  sub('elm-pf', 'Proyecto Final', 5, 'electromecanica'),
  

  // Materias Electivas (Electromecánica)
  ele('elm-ele-hidrodinamica-y-neumatica', 'Hidrodinámica y Neumática', 99, 'electromecanica'),
  ele('elm-ele-mantenimiento-electromecanico', 'Mantenimiento Electromecánico', 99, 'electromecanica'),
  ele('elm-ele-calculo-y-control-de-maq-electrica', 'Cálculo y Control de Maq. Eléctrica', 99, 'electromecanica'),
  ele('elm-ele-maquinas-y-equipos-industriales', 'Máquinas y Equipos Industriales', 99, 'electromecanica'),
];

// ============================================================
// MATERIAS BÁSICAS (comunes a todas las ingenierías)
// ============================================================
const basicasSubs: Subject[] = [
  // 1er Año Básicas
  sub('bas-aga', 'Álgebra y Geometría Analítica', 1, 'basicas'),
  sub('bas-am1', 'Análisis Matemático I', 1, 'basicas'),
  sub('bas-fis1', 'Física I', 1, 'basicas'),
  {...sub('bas-qg', 'Química General', 1, 'basicas'), excludedCareers: ['sistemas']},
  sub('bas-iys', 'Ingeniería y Sociedad', 1, 'basicas'),
  sub('bas-ing1', 'Inglés I', 1, 'basicas'),
  sub('bas-ing2', 'Inglés II', 1, 'basicas'),
  
  // 2do Año Básicas
  sub('bas-am2', 'Análisis Matemático II', 2, 'basicas'),
  sub('bas-fis2', 'Física II', 2, 'basicas'),
  sub('bas-pye', 'Probabilidad y Estadística', 2, 'basicas'),
  sub('bas-eco', 'Economía', 2, 'basicas'),
  sub('bas-leg', 'Legislación', 2, 'basicas'),
];

// ============================================================
// INGENIERÍA EN TELECOMUNICACIONES
// ============================================================
const telecomunicacionesSubs: Subject[] = [
  // 1er Año
  sub('tel-ie', 'Introducción a la Ingeniería Electrónica', 1, 'telecomunicaciones'),
  sub('tel-inf1', 'Informática I', 1, 'telecomunicaciones'),
  // 2do Año
  sub('tel-inf2', 'Informática II', 2, 'telecomunicaciones'),
  sub('tel-tc1', 'Teoría de Circuitos I', 2, 'telecomunicaciones'),
  sub('tel-ts', 'Transmitología', 2, 'telecomunicaciones'),
  sub('tel-ea1', 'Electrónica Aplicada I', 2, 'telecomunicaciones'),
  // 3er Año
  sub('tel-ea2', 'Electrónica Aplicada II', 3, 'telecomunicaciones'),
  sub('tel-tc2', 'Teoría de Circuitos II', 3, 'telecomunicaciones'),
  sub('tel-em1', 'Electromagnetismo I', 3, 'telecomunicaciones'),
  sub('tel-sd1', 'Sistemas Digitales I', 3, 'telecomunicaciones'),
  // 4to Año
  sub('tel-sc1', 'Sistemas de Comunicaciones', 4, 'telecomunicaciones'),
  sub('tel-pds', 'Procesamiento Digital de Señales', 4, 'telecomunicaciones'),
  sub('tel-rdatos', 'Redes de Datos', 4, 'telecomunicaciones'),
  sub('tel-mo', 'Microondas y Optoelectrónica', 4, 'telecomunicaciones'),
  // 5to Año
  sub('tel-sc2', 'Sistemas de Comunicaciones Avanzados', 5, 'telecomunicaciones'),
  sub('tel-tel', 'Telefonía y Conmutación', 5, 'telecomunicaciones'),
  sub('tel-pf', 'Proyecto Final', 5, 'telecomunicaciones'),
];

// ============================================================
// ALL SUBJECTS COMBINED
// ============================================================
export const subjectsData: Subject[] = [
  ...basicasSubs,
  ...sistemasSubs,
  ...civilSubs,
  ...quimicaSubs,
  ...electronicaSubs,
  ...electromecanicaSubs,
  ...telecomunicacionesSubs,
  ...sharedElectives
];


// Helper to get subjects by career
export const getSubjectsByCareer = (careerId: string): Subject[] =>
  subjectsData.filter(s => {
    if (s.excludedCareers && s.excludedCareers.includes(careerId)) return false;
    return (s.careerId === careerId || (s.careerPaths && s.careerPaths.some(p => p.careerId === careerId)));
  });

// Helper to get subjects by career and year
export const getSubjectsByCareerAndYear = (careerId: string, year: number): Subject[] =>
  subjectsData.filter(s => {
    if (s.excludedCareers && s.excludedCareers.includes(careerId)) return false;
    if (s.careerPaths && s.careerPaths.some(p => p.careerId === careerId && p.year === year)) return true;
    if (s.careerId === careerId && s.year === year) return true;
    return false;
  });

export const yearConfig: Record<number, { label: string; icon: string; bg: string; text: string; border: string; accent: string }> = {
  1: { label: '1er Año', icon: 'Sprout', bg: 'bg-[#E8F0EA]', text: 'text-[#4A7A52]', border: 'border-[#C5DBC9]', accent: '#8BAA91' },
  2: { label: '2do Año', icon: 'BookOpen', bg: 'bg-[#E5EFF5]', text: 'text-[#4A6E82]', border: 'border-[#C5D6E2]', accent: '#7BA7C2' },
  3: { label: '3er Año', icon: 'Microscope', bg: 'bg-[#EFEBF5]', text: 'text-[#6B5A8E]', border: 'border-[#D5CCE5]', accent: '#9B8BBF' },
  4: { label: '4to Año', icon: 'Rocket', bg: 'bg-[#FFF0E5]', text: 'text-[#9B6B3D]', border: 'border-[#E8D4BF]', accent: '#E8A87C' },
  5: { label: '5to Año', icon: 'GraduationCap', bg: 'bg-[#FAEAE4]', text: 'text-[#9B5D44]', border: 'border-[#E8CFC3]', accent: '#D4856A' },
  6: { label: '6to Año', icon: 'Award', bg: 'bg-[#F5E8E8]', text: 'text-[#8E5A5A]', border: 'border-[#E2CECE]', accent: '#C28B8B' },
  99: { label: 'Electivas', icon: 'Award', bg: 'bg-[#F2EDF7]', text: 'text-[#6A4E8A]', border: 'border-[#D9CFE5]', accent: '#A080C0' },
};
