import { 
  Calculator, Atom, BookOpen, Binary, Cpu, Network, Database, 
  Code2, LineChart, Briefcase, ShieldCheck, 
  CheckCircle2, AlertTriangle, Lock, Unlock, X, Info,
  GraduationCap, ChevronRight, Layers, Sparkles, Filter,
  Building2, FlaskConical, Zap, Wrench, Microscope, ArrowLeft, Radio, FileText
} from 'lucide-react';
import React from 'react';

// --- Base de Datos Multi-Carrera adaptada ---
export const planesData = {
  sistemas: {
    id: 'sistemas',
    name: 'Ingeniería en Sistemas',
    shortName: 'Sistemas',
    years: 5,
    icon: React.createElement(Code2, { className: "w-8 h-8" }),
    color: 'from-[#8BAA91] to-[#7CC2A8]',
    curriculum: [
      {
            "id": 1,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Análisis Matemático I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 2,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Álgebra y Geometría Analítica",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 5,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Lógica y Estructuras Discretas",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 6,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Algoritmo y Estructura de Datos",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 7,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Arquitectura de Computadoras",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 8,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Sistemas y Procesos de Negocio",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 3,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Física I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 4,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Inglés I",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 16,
            "year": 2,
            "semester": "Anual",
            "name": "Análisis de Sistemas de Información",
            "weekly_hours": 6,
            "total_hours": 144,
            "regulares": [
                  6,
                  8
            ],
            "aprobadas": []
      },
      {
            "id": 9,
            "year": 2,
            "semester": "1º Cuatrimestre",
            "name": "Análisis Matemático II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  1,
                  2
            ],
            "aprobadas": []
      },
      {
            "id": 13,
            "year": 2,
            "semester": "1º Cuatrimestre",
            "name": "Sintaxis y Semántica de los Lenguajes",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  5,
                  6
            ],
            "aprobadas": []
      },
      {
            "id": 11,
            "year": 2,
            "semester": "1º Cuatrimestre",
            "name": "Ingeniería y Sociedad",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 12,
            "year": 2,
            "semester": "1º Cuatrimestre",
            "name": "Inglés II",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  4
            ],
            "aprobadas": []
      },
      {
            "id": 10,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Física II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  1,
                  3
            ],
            "aprobadas": []
      },
      {
            "id": 14,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Paradigmas de Programación",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  5,
                  6
            ],
            "aprobadas": []
      },
      {
            "id": 15,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Sistemas Operativos",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  7
            ],
            "aprobadas": []
      },
      {
            "id": 23,
            "year": 3,
            "semester": "Anual",
            "name": "Diseño de Sistemas de Información",
            "weekly_hours": 6,
            "total_hours": 144,
            "regulares": [
                  14,
                  16
            ],
            "aprobadas": [
                  4,
                  6,
                  8
            ]
      },
      {
            "id": 17,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Probabilidad y Estadística",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  1,
                  2
            ],
            "aprobadas": []
      },
      {
            "id": 18,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Economía",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [],
            "aprobadas": [
                  1,
                  2
            ]
      },
      {
            "id": 19,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Base de Datos",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  13,
                  16
            ],
            "aprobadas": [
                  5,
                  6
            ]
      },
      {
            "id": 21,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Comunicación de Datos",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [],
            "aprobadas": [
                  3,
                  7
            ]
      },
      {
            "id": 20,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Desarrollo de Software",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  14,
                  16
            ],
            "aprobadas": [
                  5,
                  6
            ]
      },
      {
            "id": 22,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Análisis Numérico",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  9
            ],
            "aprobadas": [
                  1,
                  2
            ]
      },
      {
            "id": 993,
            "year": 3,
            "semester": "Electiva",
            "name": "Materias Electivas",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 37,
            "year": 4,
            "semester": "1º Cuatrimestre",
            "name": "Seminario Integrador (opcional)",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  15,
                  19,
                  20
            ],
            "aprobadas": [
                  5,
                  6,
                  7,
                  8
            ]
      },
      {
            "id": 30,
            "year": 4,
            "semester": "Anual",
            "name": "Administración de Sistemas de Información",
            "weekly_hours": 6,
            "total_hours": 144,
            "regulares": [
                  18,
                  23
            ],
            "aprobadas": [
                  16
            ]
      },
      {
            "id": 25,
            "year": 4,
            "semester": "Anual",
            "name": "Ingeniería y Calidad de Software",
            "weekly_hours": 6,
            "total_hours": 72,
            "regulares": [
                  19,
                  20,
                  23
            ],
            "aprobadas": [
                  13,
                  14
            ]
      },
      {
            "id": 24,
            "year": 4,
            "semester": "1º Cuatrimestre",
            "name": "Legislación",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  11
            ],
            "aprobadas": []
      },
      {
            "id": 27,
            "year": 4,
            "semester": "1º Cuatrimestre",
            "name": "Investigación Operativa",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  17,
                  22
            ],
            "aprobadas": []
      },
      {
            "id": 28,
            "year": 4,
            "semester": "1º Cuatrimestre",
            "name": "Simulación",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  17
            ],
            "aprobadas": [
                  9
            ]
      },
      {
            "id": 26,
            "year": 4,
            "semester": "2º Cuatrimestre",
            "name": "Redes de Datos",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  15,
                  21
            ],
            "aprobadas": []
      },
      {
            "id": 29,
            "year": 4,
            "semester": "2º Cuatrimestre",
            "name": "Tecnología para la Automatización",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  10,
                  22
            ],
            "aprobadas": [
                  9
            ]
      },
      {
            "id": 994,
            "year": 4,
            "semester": "Electiva",
            "name": "Materias Electivas",
            "weekly_hours": 6,
            "total_hours": 144,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 36,
            "year": 5,
            "semester": "Anual",
            "name": "Proyecto Final",
            "weekly_hours": 6,
            "total_hours": 144,
            "regulares": [
                  25,
                  26,
                  30
            ],
            "aprobadas": [
                  12,
                  20,
                  23
            ]
      },
      {
            "id": 33,
            "year": 5,
            "semester": "1º Cuatrimestre",
            "name": "Sistemas de Gestión",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  18,
                  27
            ],
            "aprobadas": [
                  23
            ]
      },
      {
            "id": 34,
            "year": 5,
            "semester": "1º Cuatrimestre",
            "name": "Gestión Gerencial",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  24,
                  30
            ],
            "aprobadas": [
                  18
            ]
      },
      {
            "id": 35,
            "year": 5,
            "semester": "1º Cuatrimestre",
            "name": "Seguridad en los Sistemas de Información",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  26,
                  30
            ],
            "aprobadas": [
                  20,
                  21
            ]
      },
      {
            "id": 31,
            "year": 5,
            "semester": "2º Cuatrimestre",
            "name": "Inteligencia Artificial",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  28
            ],
            "aprobadas": [
                  17,
                  22
            ]
      },
      {
            "id": 32,
            "year": 5,
            "semester": "2º Cuatrimestre",
            "name": "Ciencia de Datos",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  28
            ],
            "aprobadas": [
                  17,
                  19
            ]
      },
      {
            "id": 995,
            "year": 5,
            "semester": "Electiva",
            "name": "Materias Electivas",
            "weekly_hours": 10,
            "total_hours": 240,
            "regulares": [],
            "aprobadas": []
      },
        {
              id: 99056,
              year: 3,
              semester: "2° Cuatrimestre",
              name: "Administración de Proyectos",
              weekly_hours: 8,
              total_hours: 0,
              regulares: [16],
              aprobadas: [8],
              docente: "Colombo, Mónica y Lastra, Graciela",
                horario: "Lunes 21:15 a 23:30 y viernes 19:00 a 22:45",
                rendir: [8],
                isElectiva: true
            },
        {
              id: 99057,
              year: 3,
              semester: "2° Cuatrimestre",
              name: "Computación Paralela",
              weekly_hours: 8,
              total_hours: 0,
              regulares: [15],
              aprobadas: [7,14],
              docente: "Bianchini, Germán y Caymes Scutari, Paola",
                horario: "Martes y Viernes 14:30 a 17:30",
                rendir: [14,7],
                isElectiva: true
            },
        {
              id: 99058,
              year: 4,
              semester: "2° Cuatrimestre",
              name: "Informática Industrial",
              weekly_hours: 8,
              total_hours: 0,
              regulares: [19,27],
              aprobadas: [14,16],
              docente: "Nicotra, Lucas y Poquet, Gustavo",
                horario: "Martes 14:30 a 19:00, Viernes 17:30 a 19:00",
                rendir: [14,16],
                isElectiva: true
            },
        {
              id: 99059,
              year: 4,
              semester: "2° Cuatrimestre",
              name: "Arquitectura de Microservicios",
              weekly_hours: 8,
              total_hours: 0,
              regulares: [20],
                aprobadas: [6, 14],
              docente: "Marsollier, Néstor y Ceccoli, Andres",
                horario: "Lunes y Jueves de 19:00 a 22:00",
                rendir: [6, 14],
                isElectiva: true
            },
        {
              id: 99060,
              year: 4,
              semester: "2° Cuatrimestre",
              name: "Base de Datos Avanzadas",
              weekly_hours: 8,
              total_hours: 0,
              regulares: [15, 19],
                aprobadas: [6, 7],
              docente: "Bloise, Leonardo y Rey, Daniel",
                horario: "Martes 16:00 a 19:00, Miércoles 19:00 a 22:00",
                rendir: [15, 19],
                isElectiva: true
            },
        {
              id: 99061,
              year: 4,
              semester: "2° Cuatrimestre",
              name: "Desarrollo de Software Dirigido por Modelos",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [19],
              aprobadas: [14,16],
              isElectiva: true
            },
        {
              id: 99062,
              year: 4,
              semester: "2° Cuatrimestre",
              name: "Gobierno Digital e Innovación",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [16],
              aprobadas: [8],
              docente: "Rotella, Carina y Bosin, Marcela",
                horario: "Lunes y Jueves 16:45 a 19:00",
                rendir: [8],
                isElectiva: true
            },
        {
              id: 99063,
              year: 4,
              semester: "Sin especificar",
              name: "Diseño de Experiencia de Usuario (UX)",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [23],
              aprobadas: [16],
              docente: "Rotella, Carina y Rotella, Andrea",
                horario: "Sábado 8:30 a 13:00",
                rendir: [16],
                isElectiva: true
            },
        {
              id: 99064,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Seguridad en Redes",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [],
              aprobadas: [],
              isElectiva: true
            },
        {
              id: 99065,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Redes Neuronales Profundas",
              weekly_hours: 8,
              total_hours: 0,
              regulares: [4,31],
              aprobadas: [6,22],
              isElectiva: true
            },
        {
              id: 99066,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Administración de Servicios en Linux",
              weekly_hours: 8,
              total_hours: 0,
              regulares: [15,26],
              aprobadas: [21],
              docente: "Faccio, Sergio y Edera, Gabriel",
                horario: "Miércoles y jueves 19:00 a 22:00",
                rendir: [21],
                isElectiva: true
            },
        {
              id: 99067,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Evaluación e Innovación de Tecnología desde la perspectiva CTS",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [11, 18],
                aprobadas: [8],
              docente: "Moralejo, Raúl y Manino, Gustavo",
                horario: "Miércoles 14:30 a 19:00",
                rendir: [8],
                isElectiva: true
            },
        {
              id: 99068,
              year: 5,
              semester: "Sin especificar",
              name: "Taller de Auditoría en Sistemas de Información",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [],
              aprobadas: [],
              isElectiva: true
            },
        {
              id: 99069,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Aprendizaje de Máquinas",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [],
              aprobadas: [],
              isElectiva: true
            },
        {
              id: 99070,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Programación Avanzada",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [],
              aprobadas: [],
              isElectiva: true
            },
        {
              id: 99071,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Taller de Programación Avanzada",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [19],
              aprobadas: [13,14],
              isElectiva: true
            },
        {
              id: 99072,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Interoperabilidad",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [23,26],
              aprobadas: [19,21],
              isElectiva: true
            },
        {
              id: 99073,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Formación de Emprendedores",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
            rendir: [19]
        }
    ]
  },
  civil: {
    id: 'civil',
    name: 'Ingeniería Civil',
    shortName: 'Civil',
    years: 6,
    icon: React.createElement(Building2, { className: "w-8 h-8" }),
    color: 'from-[#E8CFC3] to-[#D4856A]',
    curriculum: [
      {
            "id": 4,
            "year": 1,
            "semester": "Anual",
            "name": "Ingeniería Civil I",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 5,
            "year": 1,
            "semester": "Anual",
            "name": "Sistemas de Representación",
            "weekly_hours": 2,
            "total_hours": 72,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 8,
            "year": 1,
            "semester": "Anual",
            "name": "Fundamentos de Informática",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 1,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Análisis Matemático I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 2,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Álgebra y Geometría Analítica",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 3,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Ingeniería y Sociedad",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 6,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Química General",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 7,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Física I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 11,
            "year": 2,
            "semester": "Anual",
            "name": "Ingeniería Civil II",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  3,
                  4,
                  5,
                  8
            ],
            "aprobadas": []
      },
      {
            "id": 9,
            "year": 2,
            "semester": "Anual",
            "name": "Análisis Matemático II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  1,
                  2
            ],
            "aprobadas": []
      },
      {
            "id": 12,
            "year": 2,
            "semester": "Anual",
            "name": "Tecnología de los Materiales",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  1,
                  5,
                  6,
                  7
            ],
            "aprobadas": []
      },
      {
            "id": 10,
            "year": 2,
            "semester": "1º Cuatrimestre",
            "name": "Estabilidad",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  1,
                  2,
                  5,
                  7,
                  8
            ],
            "aprobadas": []
      },
      {
            "id": 13,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Física II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  1,
                  7
            ],
            "aprobadas": []
      },
      {
            "id": 14,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Probabilidad y Estadística",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  1,
                  2
            ],
            "aprobadas": []
      },
      {
            "id": 15,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Inglés I (Materia cuatrimestral de cualquier cuatrimestre. Puede rendir libre).",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  3
            ],
            "aprobadas": []
      },
      {
            "id": 16,
            "year": 3,
            "semester": "Anual",
            "name": "Resistencia de Materiales",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  10
            ],
            "aprobadas": [
                  1,
                  2,
                  7,
                  8
            ]
      },
      {
            "id": 18,
            "year": 3,
            "semester": "Anual",
            "name": "Tecnología de la Construcción",
            "weekly_hours": 6,
            "total_hours": 144,
            "regulares": [
                  10,
                  11,
                  12,
                  15
            ],
            "aprobadas": [
                  1,
                  2,
                  4,
                  5,
                  6,
                  7,
                  8
            ]
      },
      {
            "id": 20,
            "year": 3,
            "semester": "Anual",
            "name": "Hidráulica General y Aplicada",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  9,
                  10,
                  11,
                  13,
                  14
            ],
            "aprobadas": [
                  1,
                  2,
                  5,
                  7,
                  8
            ]
      },
      {
            "id": 17,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Tecnología del Hormigón",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  12,
                  14,
                  15
            ],
            "aprobadas": [
                  1,
                  2,
                  6,
                  7
            ]
      },
      {
            "id": 22,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Instalaciones Eléctricas Acústicas",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  11,
                  12,
                  13
            ],
            "aprobadas": [
                  1,
                  2,
                  4,
                  5,
                  6,
                  7
            ]
      },
      {
            "id": 23,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Instalaciones Termomecánicas",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  11,
                  12,
                  13
            ],
            "aprobadas": [
                  1,
                  2,
                  4,
                  5,
                  6,
                  7
            ]
      },
      {
            "id": 19,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Geotopografía",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  9,
                  11,
                  13,
                  14
            ],
            "aprobadas": [
                  1,
                  2,
                  4,
                  5,
                  7
            ]
      },
      {
            "id": 21,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Cálculo Avanzado",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  9,
                  10,
                  12,
                  14
            ],
            "aprobadas": [
                  1,
                  2,
                  5,
                  7,
                  8
            ]
      },
      {
            "id": 24,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Economía",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  11,
                  14,
                  15
            ],
            "aprobadas": [
                  1,
                  2,
                  3,
                  4,
                  8
            ]
      },
      {
            "id": 25,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Inglés II (Materia cuatrimestral de cualquier cuatrimestre. Puede rendir libre).",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  15
            ],
            "aprobadas": [
                  3,
                  4
            ]
      },
      {
            "id": 28,
            "year": 4,
            "semester": "Anual",
            "name": "Diseño Arquitectónico, Planeamiento y Urbanismo",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  18,
                  19,
                  22,
                  23,
                  24,
                  25
            ],
            "aprobadas": [
                  10,
                  11,
                  12,
                  15
            ]
      },
      {
            "id": 31,
            "year": 4,
            "semester": "Anual",
            "name": "Hidrología y Obras Hidráulicas",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  16,
                  18,
                  19,
                  20,
                  24,
                  25
            ],
            "aprobadas": [
                  9,
                  10,
                  11,
                  12,
                  13,
                  14
            ]
      },
      {
            "id": 27,
            "year": 4,
            "semester": "1º Cuatrimestre",
            "name": "Instalaciones Sanitarias y Gas",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  18,
                  19,
                  20,
                  24
            ],
            "aprobadas": [
                  5,
                  6,
                  7,
                  8,
                  12
            ]
      },
      {
            "id": 29,
            "year": 4,
            "semester": "1º Cuatrimestre",
            "name": "Análisis Estructural I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  16,
                  17
            ],
            "aprobadas": [
                  9,
                  10,
                  11,
                  14
            ]
      },
      {
            "id": 26,
            "year": 4,
            "semester": "2º Cuatrimestre",
            "name": "Geotecnia",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  16,
                  17,
                  18,
                  19,
                  20
            ],
            "aprobadas": [
                  9,
                  10,
                  11,
                  12,
                  13,
                  14
            ]
      },
      {
            "id": 30,
            "year": 4,
            "semester": "2º Cuatrimestre",
            "name": "Estructuras de Hormigón",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  16,
                  17,
                  18,
                  19,
                  25
            ],
            "aprobadas": [
                  9,
                  10,
                  11,
                  12,
                  13,
                  14
            ]
      },
      {
            "id": 32,
            "year": 4,
            "semester": "2º Cuatrimestre",
            "name": "Ingeniería Legal",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  9,
                  11,
                  14,
                  15
            ],
            "aprobadas": [
                  1,
                  2,
                  3,
                  4,
                  8
            ]
      },
      {
            "id": 36,
            "year": 5,
            "semester": "Anual",
            "name": "Organización y Conducción de Obras",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  26,
                  27,
                  28,
                  30,
                  31
            ],
            "aprobadas": [
                  17,
                  18,
                  19,
                  20,
                  22,
                  23,
                  24,
                  25
            ]
      },
      {
            "id": 34,
            "year": 5,
            "semester": "1º Cuatrimestre",
            "name": "Cimentaciones",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  21,
                  26,
                  29,
                  30,
                  31
            ],
            "aprobadas": [
                  16,
                  17,
                  18,
                  19,
                  20
            ]
      },
      {
            "id": 35,
            "year": 5,
            "semester": "1º Cuatrimestre",
            "name": "Ingeniería Sanitaria",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  26,
                  27,
                  31
            ],
            "aprobadas": [
                  17,
                  18,
                  19,
                  20,
                  25
            ]
      },
      {
            "id": 37,
            "year": 5,
            "semester": "1º Cuatrimestre",
            "name": "Vías de Comunicación I",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  17,
                  18,
                  19
            ],
            "aprobadas": [
                  9,
                  10,
                  11,
                  12,
                  14,
                  15
            ]
      },
      {
            "id": 40,
            "year": 5,
            "semester": "1º Cuatrimestre",
            "name": "Gestión Ambiental y Desarrollo Sustentable",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  26,
                  28,
                  31,
                  32
            ],
            "aprobadas": [
                  20,
                  24,
                  25
            ]
      },
      {
            "id": 33,
            "year": 5,
            "semester": "2º Cuatrimestre",
            "name": "Construcciones Metálicas y de Madera",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  21,
                  29
            ],
            "aprobadas": [
                  16,
                  17,
                  18,
                  19
            ]
      },
      {
            "id": 38,
            "year": 5,
            "semester": "2º Cuatrimestre",
            "name": "Análisis Estructural II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  21,
                  26,
                  29,
                  30,
                  31
            ],
            "aprobadas": [
                  16,
                  17,
                  18,
                  19,
                  25
            ]
      },
      {
            "id": 39,
            "year": 5,
            "semester": "2º Cuatrimestre",
            "name": "Vías de Comunicación II",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  26,
                  30,
                  31,
                  32,
                  37
            ],
            "aprobadas": [
                  16,
                  17,
                  18,
                  19,
                  20,
                  24
            ]
      },
      {
            "id": 41,
            "year": 6,
            "semester": "1º Cuatrimestre",
            "name": "Proyecto Final",
            "weekly_hours": 8,
            "total_hours": 96,
            "regulares": [
              26,
              27,
              28,
              29,
              30,
              31,
              32
            ],
            "aprobadas": [
              15,
              16,
              17,
              18,
              19,
              20,
              22,
              23,
              24,
              25
            ]
          },
      {
            "id": 999,
            "year": 6,
            "semester": "Electiva",
            "name": "Materias Electivas",
            "weekly_hours": 22,
            "total_hours": 264,
            "regulares": [],
            "aprobadas": []
      },
        {
              id: 99001,
              year: 3,
              semester: "1° Cuatrimestre",
              name: "Geología Aplicada",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [12],
              aprobadas: [4,6,7],
              isElectiva: true,
            rendir: [12]
        },
        {
              id: 99002,
              year: 4,
              semester: "1° Cuatrimestre",
              name: "Sustentabilidad del Recurso Hídrico",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [20,18],
              aprobadas: [11],
              isElectiva: true,
            rendir: [11, 20, 18]
        },
        {
              id: 99003,
              year: 4,
              semester: "2° Cuatrimestre",
              name: "Ferrocarriles",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [37,18],
              aprobadas: [11,12],
              isElectiva: true,
            rendir: [37, 18]
        },
        {
              id: 99004,
              year: 4,
              semester: "2° Cuatrimestre",
              name: "Tránsito y Transporte",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [37],
              aprobadas: [14,11],
              isElectiva: true,
            rendir: [37]
        },
        {
              id: 99005,
              year: 4,
              semester: "2° Cuatrimestre",
              name: "Prefabricación",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [17,16],
              aprobadas: [18,12],
              isElectiva: true,
            rendir: [17, 16]
        },
        {
              id: 99006,
              year: 4,
              semester: "2° Cuatrimestre",
              name: "Diseño Estructural",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [16,18,29],
              aprobadas: [10,11],
              isElectiva: true,
            rendir: [16, 29]
        },
        {
              id: 99007,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Gestión Ingenieril",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [24,32],
              aprobadas: [18],
              isElectiva: true,
            rendir: [24, 32]
        },
        {
              id: 99008,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Dinámica de Estructuras",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [29,21],
              aprobadas: [9,16],
              isElectiva: true,
            rendir: [29, 21]
        },
        {
              id: 99009,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Análisis Estructural III",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [29,30],
              aprobadas: [16,21],
              isElectiva: true,
            rendir: [29, 30]
        },
        {
              id: 99010,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Saneamiento y Medio Ambiente",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [31,32],
              aprobadas: [11,20],
              isElectiva: true,
            rendir: [31]
        },
        {
              id: 99011,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Vialidad Especial",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [37],
              aprobadas: [18],
              isElectiva: true,
            rendir: [37]
        },
        {
              id: 99012,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Caminos y Túneles de Montañas",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [37,31],
              aprobadas: [17,19],
              isElectiva: true,
            rendir: [37, 31]
        },
        {
              id: 99013,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Obras Fluviales y Costeras",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [31],
              aprobadas: [19,17,18],
              isElectiva: true,
            rendir: [20, 31]
        },
        {
              id: 99014,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Centrales y Máquinas Hidráulicas",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [20,22],
              aprobadas: [19,16],
              isElectiva: true,
            rendir: [31, 22, 20]
        },
        {
              id: 99015,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Puentes",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [26,30],
              aprobadas: [17,16],
              isElectiva: true,
            rendir: [26, 30]
        },
        {
              id: 99016,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Diseño Sustentable de Edificios",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [28,32],
              aprobadas: [18],
              isElectiva: true,
            rendir: [28, 32]
        }
    ]
  },
  quimica: {
    id: 'quimica',
    name: 'Ingeniería Química',
    shortName: 'Química',
    years: 5,
    icon: React.createElement(FlaskConical, { className: "w-8 h-8" }),
    color: 'from-[#F5E8E8] to-[#C28B8B]',
    curriculum: [
      {
            "id": 1,
            "year": 1,
            "semester": "Anual",
            "name": "Introducción a la Ingeniería Química",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 7,
            "year": 1,
            "semester": "Anual",
            "name": "Sistemas de representación",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 2,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Ingeniería y Sociedad",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 3,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Álgebra y Geometría Analítica",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 4,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Análisis Matemático I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 5,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Física I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 6,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Química",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 9,
            "year": 2,
            "semester": "Anual",
            "name": "Introducción a Equipos y Procesos",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  1,
                  6
            ],
            "aprobadas": []
      },
      {
            "id": 14,
            "year": 2,
            "semester": "Anual",
            "name": "Química Orgánica",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  6
            ],
            "aprobadas": []
      },
      {
            "id": 10,
            "year": 2,
            "semester": "1º Cuatrimestre",
            "name": "Probabilidad y Estadística",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  3,
                  4
            ],
            "aprobadas": []
      },
      {
            "id": 11,
            "year": 2,
            "semester": "1º Cuatrimestre",
            "name": "Química Inorgánica",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  6
            ],
            "aprobadas": []
      },
      {
            "id": 12,
            "year": 2,
            "semester": "1º Cuatrimestre",
            "name": "Análisis Matemático II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  3,
                  4
            ],
            "aprobadas": []
      },
      {
            "id": 13,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Física II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  4,
                  5
            ],
            "aprobadas": []
      },
      {
            "id": 15,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Legislación",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  1,
                  2
            ],
            "aprobadas": []
      },
      {
            "id": 8,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Fundamentos de Informática",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 16,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Inglés I (Nota: Consultar en Bedelía de Básicas por cursado en 1º Cuatrimestre)",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 17,
            "year": 3,
            "semester": "Anual",
            "name": "Balances de Masa y Energía",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  6,
                  7,
                  8,
                  9,
                  13
            ],
            "aprobadas": [
                  1,
                  3,
                  4
            ]
      },
      {
            "id": 18,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Termodinámica",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  11,
                  12,
                  13
            ],
            "aprobadas": [
                  4,
                  6
            ]
      },
      {
            "id": 19,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Matemática Superior Aplicada",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  12
            ],
            "aprobadas": [
                  3,
                  4
            ]
      },
      {
            "id": 23,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Química Analítica",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  10,
                  11,
                  14
            ],
            "aprobadas": [
                  2,
                  6
            ]
      },
      {
            "id": 24,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Microbiología y Química Biológica",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  11,
                  14
            ],
            "aprobadas": [
                  6
            ]
      },
      {
            "id": 20,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Ciencia de los Materiales",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  9,
                  11,
                  14
            ],
            "aprobadas": [
                  1,
                  6
            ]
      },
      {
            "id": 21,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Fisicoquímica",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  9,
                  12,
                  13
            ],
            "aprobadas": [
                  3,
                  4,
                  6
            ]
      },
      {
            "id": 22,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Fenómenos de Transporte",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  9,
                  12,
                  13
            ],
            "aprobadas": [
                  3,
                  4,
                  6
            ]
      },
      {
            "id": 25,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Química Analítica Aplicada",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  9,
                  11,
                  13,
                  16
            ],
            "aprobadas": [
                  1,
                  2,
                  6,
                  16
            ]
      },
      {
            "id": 26,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Inglés II (Nota: Se cursará a partir del 1º cuatrimestre del 2024)",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  16
            ],
            "aprobadas": []
      },
      {
            "id": 27,
            "year": 4,
            "semester": "Anual",
            "name": "Diseño, simulación, optimización y seguridad de procesos",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  17,
                  19
            ],
            "aprobadas": [
                  7,
                  8,
                  9,
                  12,
                  26
            ]
      },
      {
            "id": 28,
            "year": 4,
            "semester": "Anual",
            "name": "Operaciones Unitarias I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  17,
                  18,
                  22
            ],
            "aprobadas": [
                  9,
                  12,
                  13
            ]
      },
      {
            "id": 32,
            "year": 4,
            "semester": "Anual",
            "name": "Ingeniería de las Reacciones Químicas",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  17,
                  18,
                  21,
                  22
            ],
            "aprobadas": [
                  11,
                  12,
                  14
            ]
      },
      {
            "id": 29,
            "year": 4,
            "semester": "1º Cuatrimestre",
            "name": "Tecnología de la Energía Térmica",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  17,
                  18,
                  21,
                  22
            ],
            "aprobadas": [
                  9,
                  12,
                  13
            ]
      },
      {
            "id": 30,
            "year": 4,
            "semester": "1º Cuatrimestre",
            "name": "Economía",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  9
            ],
            "aprobadas": [
                  2,
                  3
            ]
      },
      {
            "id": 33,
            "year": 4,
            "semester": "1º Cuatrimestre",
            "name": "Calidad y Control Estadístico de Procesos",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  10
            ],
            "aprobadas": [
                  4
            ]
      },
      {
            "id": 31,
            "year": 4,
            "semester": "2º Cuatrimestre",
            "name": "Operaciones Unitarias II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  18,
                  21,
                  22
            ],
            "aprobadas": [
                  9,
                  12,
                  13,
                  14
            ]
      },
      {
            "id": 34,
            "year": 4,
            "semester": "2º Cuatrimestre",
            "name": "Organización Industrial",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  10
            ],
            "aprobadas": [
                  2,
                  9,
                  15
            ]
      },
      {
            "id": 35,
            "year": 5,
            "semester": "Anual",
            "name": "Control Automático de Procesos",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  27,
                  31
            ],
            "aprobadas": [
                  17,
                  19,
                  23
            ]
      },
      {
            "id": 41,
            "year": 5,
            "semester": "Anual",
            "name": "Proyecto Final",
            "note": "Para rendir se requiere tener aprobadas todas",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  27,
                  28,
                  29,
                  31,
                  32,
                  34
            ],
            "aprobadas": [
                  17,
                  21,
                  22,
                  25,
                  30
            ]
      },
      {
            "id": 37,
            "year": 5,
            "semester": "Anual",
            "name": "Ingeniería Ambiental",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  25,
                  28,
                  31,
                  32
            ],
            "aprobadas": [
                  15,
                  17,
                  23
            ]
      },
      {
            "id": 36,
            "year": 5,
            "semester": "1º Cuatrimestre",
            "name": "Mecánica Industrial",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  9,
                  21
            ],
            "aprobadas": [
                  5,
                  11,
                  20
            ]
      },
      {
            "id": 38,
            "year": 5,
            "semester": "2º Cuatrimestre",
            "name": "Procesos Biotecnológicos",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  17,
                  21,
                  22,
                  24
            ],
            "aprobadas": [
                  9,
                  11,
                  14
            ]
      },
      {
            "id": 39,
            "year": 5,
            "semester": "2º Cuatrimestre",
            "name": "Higiene y Seguridad en el Trabajo",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
              11,
              14,
              17
            ],
            "aprobadas": [
              9
            ]
          },
      {
            "id": 40,
            "year": 5,
            "semester": "2º Cuatrimestre",
            "name": "Máquinas e Instalaciones Eléctricas",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  9,
                  13
            ],
            "aprobadas": [
                  28
            ]
      },
      {
            "id": 998,
            "year": 5,
            "semester": "Electiva",
            "name": "Materias Electivas",
            "weekly_hours": 12,
            "total_hours": 288,
            "regulares": [],
            "aprobadas": []
      },
        {
              id: 99041,
              year: 3,
              semester: "2° Cuatrimestre",
              name: "Epistemología",
              weekly_hours: 5,
              total_hours: 0,
              regulares: [],
              aprobadas: [],
              isElectiva: true
            },
        {
              id: 99042,
              year: 3,
              semester: "2° Cuatrimestre",
              name: "Metodología de la Investigación",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [],
              aprobadas: [],
              isElectiva: true
            },
        {
              id: 99043,
              year: 4,
              semester: "1° Cuatrimestre",
              name: "Utilitarios de Computación",
              weekly_hours: 4,
              total_hours: 0,
              regulares: [21,22],
              aprobadas: [11,18],
              isElectiva: true,
            rendir: [21, 22]
        },
        {
              id: 99044,
              year: 4,
              semester: "2° Cuatrimestre",
              name: "Gestión de RRHH",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [17,18,20,21,22,23,24,26],
              aprobadas: [8,9,10,11,12,13,14,15,16],
              isElectiva: true,
            rendir: [17, 18, 20, 21, 22, 23, 24, 26]
        },
        {
              id: 99045,
              year: 4,
              semester: "2° Cuatrimestre",
              name: "Análisis del Ciclo de Vida (ACV)",
              weekly_hours: 4,
              total_hours: 0,
              regulares: [17,22],
              aprobadas: [9],
              isElectiva: true,
            rendir: [17, 22]
        },
        {
              id: 99046,
              year: 5,
              semester: "Anual",
              name: "Instalaciones de Maq. térmicas y fluidodinámicas",
              weekly_hours: 8,
              total_hours: 0,
              regulares: [28,29,31],
              aprobadas: [18],
              isElectiva: true,
            rendir: [28, 29, 31]
        },
        {
              id: 99047,
              year: 5,
              semester: "Anual",
              name: "Industrialización de Hidrocarburos",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [28,29,31,32],
              aprobadas: [18,21,22],
              isElectiva: true,
            rendir: [28, 29, 31, 32]
        },
        {
              id: 99048,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Gestión Empresarial I",
              weekly_hours: 4,
              total_hours: 0,
              regulares: [30,33],
              aprobadas: [3,12],
              isElectiva: true,
            rendir: [30, 33]
        },
        {
              id: 99049,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Bioquímica de los Alimentos",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [21,24],
              aprobadas: [11,14],
              isElectiva: true,
            rendir: [21, 24]
        },
        {
              id: 99050,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Ind. Alimentarias",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [20,28,29],
              aprobadas: [],
              isElectiva: true,
            rendir: [20, 28, 29]
        },
        {
              id: 99051,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Ind. de Base Extractiva - Ext., Fracc., Ref.",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [28,31,32],
              aprobadas: [28],
              isElectiva: true,
            rendir: [28, 31, 32]
        },
        {
              id: 99052,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Evaluación de Impacto Ambiental",
              weekly_hours: 4,
              total_hours: 0,
              regulares: [22,23],
              aprobadas: [6],
              isElectiva: true,
            rendir: [22, 23]
        },
        {
              id: 99053,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Gestión Empresarial II",
              weekly_hours: 4,
              total_hours: 0,
              regulares: [33],
              aprobadas: [3,12,21],
              isElectiva: true,
            rendir: [33]
        },
        {
              id: 99054,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Ing. Industrial de Recursos Naturales Regionales",
              weekly_hours: 6,
              total_hours: 0,
              regulares: [17,20,28,29],
              aprobadas: [],
              isElectiva: true,
            rendir: [17, 20, 28, 29]
        },
        {
              id: 99055,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Formación de Emprendedores",
              weekly_hours: 4,
              total_hours: 0,
              regulares: [19],
              aprobadas: [],
              isElectiva: true,
            rendir: [19]
        }
    ]
  },
  electronica: {
    id: 'electronica',
    name: 'Ingeniería Electrónica',
    shortName: 'Electrónica',
    years: 6,
    icon: React.createElement(Cpu, { className: "w-8 h-8" }),
    color: 'from-[#FFF0E5] to-[#E8A87C]',
    curriculum: [
      {
            "id": 1,
            "year": 1,
            "semester": "Anual",
            "name": "Informática I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 2,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Álgebra y Geometría Analítica",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 3,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Análisis Matemático I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 4,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Ingeniería y Sociedad",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 5,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Análisis Matemático II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  2,
                  3
            ],
            "aprobadas": []
      },
      {
            "id": 6,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Física I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 7,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Diseño asistido por computadora",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 8,
            "year": 2,
            "semester": "Anual",
            "name": "Informática II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  1,
                  2,
                  3
            ],
            "aprobadas": []
      },
      {
            "id": 9,
            "year": 2,
            "semester": "Anual",
            "name": "Análisis de Señales y Sistemas",
            "weekly_hours": 6,
            "total_hours": 144,
            "regulares": [
                  5
            ],
            "aprobadas": [
                  2,
                  3
            ]
      },
      {
            "id": 10,
            "year": 2,
            "semester": "1º Cuatrimestre",
            "name": "Química General",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 11,
            "year": 2,
            "semester": "1º Cuatrimestre",
            "name": "Física II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  3,
                  6
            ],
            "aprobadas": []
      },
      {
            "id": 12,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Probabilidad y Estadística",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  2,
                  3
            ],
            "aprobadas": []
      },
      {
            "id": 13,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Física Electrónica",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  11
            ],
            "aprobadas": [
                  2,
                  3,
                  6
            ]
      },
      {
            "id": 14,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Inglés I (Nota: Consultar en Bedelía de Básicas por cursado en 1º Cuatrimestre)",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 15,
            "year": 3,
            "semester": "Anual",
            "name": "Teoría de los Circuitos I",
            "weekly_hours": 6,
            "total_hours": 144,
            "regulares": [
                  5,
                  11
            ],
            "aprobadas": [
                  3,
                  6
            ]
      },
      {
            "id": 16,
            "year": 3,
            "semester": "Anual",
            "name": "Técnicas Digitales I",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  1
            ],
            "aprobadas": [
                  2
            ]
      },
      {
            "id": 17,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Dispositivos Electrónicos",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  1,
                  3,
                  10
            ],
            "aprobadas": []
      },
      {
            "id": 18,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Legislación",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  8
            ],
            "aprobadas": [
                  4
            ]
      },
      {
            "id": 21,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Inglés II (Nota: Se cursará a partir del 1º cuatrimestre del 2024)",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": [
                  14
            ]
      },
      {
            "id": 19,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Electrónica Aplicada I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  10,
                  11
            ],
            "aprobadas": [
                  1,
                  3,
                  6
            ]
      },
      {
            "id": 20,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Medios de Enlace",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  5,
                  11
            ],
            "aprobadas": [
                  2,
                  3,
                  6
            ]
      },
      {
            "id": 22,
            "year": 4,
            "semester": "Anual",
            "name": "Técnicas Digitales II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  8,
                  16,
                  19
            ],
            "aprobadas": [
                  10,
                  11
            ]
      },
      {
            "id": 23,
            "year": 4,
            "semester": "Anual",
            "name": "Medidas Electrónicas I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  9,
                  15,
                  16,
                  19
            ],
            "aprobadas": [
                  5,
                  10,
                  11
            ]
      },
      {
            "id": 24,
            "year": 4,
            "semester": "Anual",
            "name": "Teoría de los Circuitos II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  9,
                  15
            ],
            "aprobadas": [
                  5,
                  11
            ]
      },
      {
            "id": 25,
            "year": 4,
            "semester": "Anual",
            "name": "Máquinas e Instalaciones Eléctricas",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  9,
                  15
            ],
            "aprobadas": [
                  5,
                  11
            ]
      },
      {
            "id": 26,
            "year": 4,
            "semester": "Anual",
            "name": "Sistemas de Comunicaciones",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  9,
                  12,
                  19,
                  20
            ],
            "aprobadas": [
                  5,
                  11
            ]
      },
      {
            "id": 27,
            "year": 4,
            "semester": "Anual",
            "name": "Electrónica Aplicada II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  9,
                  13,
                  15,
                  17,
                  19
            ],
            "aprobadas": [
                  5,
                  11,
                  14
            ]
      },
      {
            "id": 28,
            "year": 4,
            "semester": "Anual",
            "name": "Seguridad, Higiene y Medio Ambiente",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": [
                  4,
                  10
            ]
      },
      {
            "id": 29,
            "year": 5,
            "semester": "Anual",
            "name": "Técnicas Digitales III",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  22
            ],
            "aprobadas": [
                  8,
                  16,
                  19
            ]
      },
      {
            "id": 30,
            "year": 5,
            "semester": "Anual",
            "name": "Medidas Electrónicas II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  22,
                  23,
                  26,
                  27
            ],
            "aprobadas": [
                  7,
                  13,
                  15,
                  16,
                  19,
                  21
            ]
      },
      {
            "id": 31,
            "year": 5,
            "semester": "Anual",
            "name": "Sistemas de Control",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  24,
                  25
            ],
            "aprobadas": [
                  13,
                  15
            ]
      },
      {
            "id": 32,
            "year": 5,
            "semester": "Anual",
            "name": "Electrónica Aplicada III",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  24,
                  26,
                  27
            ],
            "aprobadas": [
                  13,
                  15,
                  19
            ]
      },
      {
            "id": 33,
            "year": 5,
            "semester": "Anual",
            "name": "Tecnología Electrónica",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  23
            ],
            "aprobadas": [
                  13,
                  16,
                  19
            ]
      },
      {
            "id": 34,
            "year": 5,
            "semester": "Anual",
            "name": "Electrónica de Potencia",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
              23,
              25,
              27
            ],
            "aprobadas": [
              13,
              16,
              19
            ]
          },
      {
            "id": 35,
            "year": 5,
            "semester": "Anual",
            "name": "Organización Industrial",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  18
            ],
            "aprobadas": []
      },
      {
            "id": 36,
            "year": 6,
            "semester": "1º Cuatrimestre",
            "name": "Economía",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  8
            ],
            "aprobadas": [
                  4
            ]
      },
      {
            "id": 37,
            "year": 6,
            "semester": "1º Cuatrimestre",
            "name": "Proyecto Final",
            "note": "Para rendir se requiere tener aprobadas todas",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  29,
                  30,
                  32
            ],
            "aprobadas": [
                  22,
                  23,
                  25,
                  27
            ]
      },
      {
            "id": 997,
            "year": 6,
            "semester": "Electiva",
            "name": "Materias Electivas",
            "weekly_hours": 8,
            "total_hours": 192,
            "regulares": [],
            "aprobadas": []
      },
        {
              id: 99021,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Redes de Datos",
              weekly_hours: 0,
              total_hours: 6,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Dr. Ing. Pérez Santiago",
              horario: "17:30"
            },
        {
              id: 99022,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Electrónica Industrial",
              weekly_hours: 0,
              total_hours: 6,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Ing. Allub Claudio",
              horario: "17:30"
            },
        {
              id: 99023,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Sistemas de Comunicaciones II",
              weekly_hours: 0,
              total_hours: 6,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Ing. Alejandro Correa",
              horario: "18:10"
            },
        {
              id: 99024,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Bioelectrónica",
              weekly_hours: 0,
              total_hours: 6,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Ing. Lombardo Germán",
              horario: "18:20"
            },
        {
              id: 99025,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Introducción a los Sist. de Gestión Gerencial",
              weekly_hours: 0,
              total_hours: 4,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Dr. Ing. Anzoise Esteban",
              horario: "18:30"
            },
        {
              id: 99026,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Sistemas de TV",
              weekly_hours: 0,
              total_hours: 6,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Ing. Boschi Cesar",
              horario: "18:50"
            },
        {
              id: 99027,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Antenas y Propagación Electromagnética",
              weekly_hours: 0,
              total_hours: 6,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Ing. Wiens Martín",
              horario: "19:30"
            },
        {
              id: 99028,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Centro de Datos: Diseño y Administración",
              weekly_hours: 0,
              total_hours: 6,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Ing. Abraham Jorge",
              horario: "20:30"
            },
        {
              id: 99029,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Sistemas de Comunicaciones III",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Colombo, Humberto",
              horario: "21:15"
            },
        {
              id: 99030,
              year: 5,
              semester: "1° Cuatrimestre",
              name: "Protecciones Digitales y Telecontrol",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Tobar, Sebastián",
              horario: "20:00"
            },
        {
              id: 99031,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Redes de Comunicaciones Móviles",
              weekly_hours: 0,
              total_hours: 6,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Ing. Manzur Nestor",
              horario: "17:20"
            },
        {
              id: 99032,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Evaluación e Innovación de Tecnología desde la perspectiva CTS",
              weekly_hours: 0,
              total_hours: 4,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Dr. Ing. Moralejo Raul",
              horario: "17:50"
            },
        {
              id: 99033,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Formación de Emprendedores",
              weekly_hours: 0,
              total_hours: 4,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Dr. Ing. Anzoise Esteban",
              horario: "18:40",
            rendir: [19]
        },
        {
              id: 99034,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Sistemas de Sonido",
              weekly_hours: 0,
              total_hours: 6,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Ing. Boschi Cesar",
              horario: "19:10"
            },
        {
              id: 99035,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Robótica",
              weekly_hours: 0,
              total_hours: 6,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Dr. Ing. Lannutti Esteban",
              horario: "19:20"
            },
        {
              id: 99036,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Electrónica Automotriz",
              weekly_hours: 0,
              total_hours: 6,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Ing. Torres Dante",
              horario: "19:40"
            },
        {
              id: 99037,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Control de Procesos",
              weekly_hours: 0,
              total_hours: 6,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Ing. Mocayar Nelson",
              horario: "20:20"
            },
        {
              id: 99038,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Teleinformática en I o T",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Mercado Gustavo",
              horario: "19:00"
            },
        {
              id: 99039,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Interoperabilidad",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Diaz Bruno",
              horario: "19:00"
            },
        {
              id: 99040,
              year: 5,
              semester: "2° Cuatrimestre",
              name: "Dis. y Admin. de Centro de Datos",
              weekly_hours: 0,
              total_hours: 0,
              regulares: [],
              aprobadas: [],
              isElectiva: true,
              docente: "Ing. Abraham Jorge",
              horario: "16:45"
            }
    ]
  },
  electromecanica: {
    id: 'electromecanica',
    name: 'Ingeniería Electromecánica',
    shortName: 'Electromecánica',
    years: 5,
    icon: React.createElement(Zap, { className: "w-8 h-8" }),
    color: 'from-[#EFEBF5] to-[#B4A7D6]',
    curriculum: [
      {
            "id": 1,
            "year": 1,
            "semester": "Anual",
            "name": "Ingeniería Electromecánica I",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 2,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Análisis Matemático I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 3,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Álgebra y Geometría Analítica",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 4,
            "year": 1,
            "semester": "1º Cuatrimestre",
            "name": "Sistemas de Representación",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 5,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Química General",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 6,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Física I",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 7,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Representación Gráfica",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 8,
            "year": 1,
            "semester": "2º Cuatrimestre",
            "name": "Ingeniería y Sociedad",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 9,
            "year": 2,
            "semester": "Anual",
            "name": "Ingeniería Electromecánica II",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  1,
                  2,
                  3
            ],
            "aprobadas": []
      },
      {
            "id": 10,
            "year": 2,
            "semester": "Anual",
            "name": "Estabilidad",
            "weekly_hours": 6,
            "total_hours": 144,
            "regulares": [
                  2,
                  3,
                  6
            ],
            "aprobadas": []
      },
      {
            "id": 11,
            "year": 2,
            "semester": "Anual",
            "name": "Conocimiento de Materiales",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  5
            ],
            "aprobadas": []
      },
      {
            "id": 12,
            "year": 2,
            "semester": "1º Cuatrimestre",
            "name": "Análisis Matemático II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  2,
                  3
            ],
            "aprobadas": []
      },
      {
            "id": 13,
            "year": 2,
            "semester": "1º Cuatrimestre",
            "name": "Física II",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  2,
                  6
            ],
            "aprobadas": []
      },
      {
            "id": 14,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Probabilidad y Estadística",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  2,
                  3
            ],
            "aprobadas": []
      },
      {
            "id": 15,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Programación en Computación",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  2,
                  3
            ],
            "aprobadas": []
      },
      {
            "id": 22,
            "year": 2,
            "semester": "2º Cuatrimestre",
            "name": "Inglés I",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [],
            "aprobadas": []
      },
      {
            "id": 16,
            "year": 3,
            "semester": "Anual",
            "name": "Ingeniería Electromecánica III",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  9,
                  12,
                  13
            ],
            "aprobadas": [
                  1,
                  2,
                  3,
                  6
            ]
      },
      {
            "id": 17,
            "year": 3,
            "semester": "Anual",
            "name": "Mecánica y Mecanismos",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  7,
                  10,
                  12
            ],
            "aprobadas": [
                  2,
                  3,
                  4,
                  6
            ]
      },
      {
            "id": 18,
            "year": 3,
            "semester": "Anual",
            "name": "Electrotecnia",
            "weekly_hours": 6,
            "total_hours": 144,
            "regulares": [
                  12,
                  13
            ],
            "aprobadas": [
                  2,
                  3,
                  6
            ]
      },
      {
            "id": 19,
            "year": 3,
            "semester": "Anual",
            "name": "Tecnología Mecánica",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  11,
                  13
            ],
            "aprobadas": [
                  2,
                  5,
                  6,
                  7
            ]
      },
      {
            "id": 20,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Termodinámica Técnica",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  13
            ],
            "aprobadas": [
                  2,
                  6
            ]
      },
      {
            "id": 21,
            "year": 3,
            "semester": "1º Cuatrimestre",
            "name": "Matemática para Ing. Electromecánica",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  2,
                  6
            ],
            "aprobadas": [
                  2,
                  3
            ]
      },
      {
            "id": 23,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Higiene y Seguridad Industrial",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  13
            ],
            "aprobadas": [
                  2,
                  6
            ]
      },
      {
            "id": 32,
            "year": 3,
            "semester": "2º Cuatrimestre",
            "name": "Inglés II",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  13
            ],
            "aprobadas": [
                  2,
                  5,
                  6,
                  8
            ]
      },
      {
            "id": 24,
            "year": 4,
            "semester": "Anual",
            "name": "Elementos de Máquinas",
            "weekly_hours": 6,
            "total_hours": 144,
            "regulares": [
                  13,
                  16,
                  17,
                  19
            ],
            "aprobadas": [
                  9,
                  10,
                  11,
                  12,
                  13,
                  15,
                  22
            ]
      },
      {
            "id": 25,
            "year": 4,
            "semester": "Anual",
            "name": "Mecánica de los Fluidos y Máquinas Fluidodinámicas",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  13,
                  17,
                  20,
                  21
            ],
            "aprobadas": [
                  10,
                  12,
                  15
            ]
      },
      {
            "id": 26,
            "year": 4,
            "semester": "Anual",
            "name": "Máquinas Térmicas",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  20,
                  21
            ],
            "aprobadas": [
                  13
            ]
      },
      {
            "id": 27,
            "year": 4,
            "semester": "Anual",
            "name": "Máquinas Eléctricas",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  18,
                  21
            ],
            "aprobadas": [
                  12,
                  13
            ]
      },
      {
            "id": 28,
            "year": 4,
            "semester": "1º Cuatrimestre",
            "name": "Mediciones Eléctricas",
            "weekly_hours": 4,
            "total_hours": 96,
            "regulares": [
                  18,
                  21
            ],
            "aprobadas": [
                  12,
                  13
            ]
      },
      {
            "id": 29,
            "year": 4,
            "semester": "1º Cuatrimestre",
            "name": "Legislación",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  9
            ],
            "aprobadas": [
                  8
            ]
      },
      {
            "id": 30,
            "year": 4,
            "semester": "2º Cuatrimestre",
            "name": "Electrónica Industrial",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  18
            ],
            "aprobadas": [
                  12,
                  13
            ]
      },
      {
            "id": 31,
            "year": 4,
            "semester": "2º Cuatrimestre",
            "name": "Economía",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  9
            ],
            "aprobadas": [
                  8
            ]
      },
      {
            "id": 33,
            "year": 5,
            "semester": "Anual",
            "name": "Redes de Distribución e Instalaciones Eléctricas",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  27,
                  28
            ],
            "aprobadas": [
                  18,
                  21
            ]
      },
      {
            "id": 34,
            "year": 5,
            "semester": "Anual",
            "name": "Máquinas y Equipos de Transporte",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  24,
                  25,
                  30
            ],
            "aprobadas": [
                  16,
                  19,
                  21,
                  22,
                  23
            ]
      },
      {
            "id": 35,
            "year": 5,
            "semester": "Anual",
            "name": "Gestión y Mantenimiento Electromecánico",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  25,
                  27,
                  30
            ],
            "aprobadas": [
                  16,
                  17,
                  18,
                  19,
                  21,
                  23
            ]
      },
      {
            "id": 36,
            "year": 5,
            "semester": "1º Cuatrimestre",
            "name": "Instalaciones Térmicas y Mecánicas",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  25,
                  26
            ],
            "aprobadas": [
                  17,
                  20,
                  21
            ]
      },
      {
            "id": 37,
            "year": 5,
            "semester": "1º Cuatrimestre",
            "name": "Automatización y Control Industrial",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  21,
                  24,
                  25,
                  27,
                  30
            ],
            "aprobadas": [
                  17,
                  18,
                  20,
                  23
            ]
      },
      {
            "id": 38,
            "year": 5,
            "semester": "2º Cuatrimestre",
            "name": "Centrales y Sistemas de Transmisión",
            "weekly_hours": 5,
            "total_hours": 120,
            "regulares": [
                  25,
                  27,
                  28,
                  30
            ],
            "aprobadas": [
                  17,
                  18,
                  20,
                  21
            ]
      },
      {
            "id": 39,
            "year": 5,
            "semester": "2º Cuatrimestre",
            "name": "Organización Industrial",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  26,
                  31
            ],
            "aprobadas": [
                  9,
                  14
            ]
      },
      {
            "id": 41,
            "year": 5,
            "semester": "2º Cuatrimestre",
            "name": "Oleohidráulica y Neumática",
            "weekly_hours": 2,
            "total_hours": 48,
            "regulares": [
                  25
            ],
            "aprobadas": [
                  13,
                  17,
                  20
            ]
      },
      {
            "id": 40,
            "year": 5,
            "semester": "2º Cuatrimestre",
            "name": "Proyecto Final",
            "weekly_hours": 3,
            "total_hours": 72,
            "regulares": [
                  25,
                  28,
                  30,
                  32
            ],
            "aprobadas": [
                  16,
                  17,
                  18,
                  19,
                  20,
                  21,
                  23
            ]
      },
      {
            "id": 996,
            "year": 5,
            "semester": "Electiva",
            "name": "Materias Electivas",
            "weekly_hours": 10,
            "total_hours": 240,
            "regulares": [],
            "aprobadas": []
      },
        {
              id: 99017,
              year: 3,
              semester: "Anual",
              name: "Hidrodinámica y Neumática",
              weekly_hours: 0,
              total_hours: 2,
              regulares: [],
              aprobadas: [],
              isElectiva: true
            },
        {
              id: 99018,
              year: 5,
              semester: "Anual",
              name: "Mantenimiento Electromecánico",
              weekly_hours: 0,
              total_hours: 3,
              regulares: [],
              aprobadas: [],
              isElectiva: true
            },
        {
              id: 99019,
              year: 5,
              semester: "Anual",
              name: "Cálculo y Control de Maq. Eléctrica",
              weekly_hours: 0,
              total_hours: 4,
              regulares: [],
              aprobadas: [],
              isElectiva: true
            },
        {
              id: 99020,
              year: 5,
              semester: "Anual",
              name: "Máquinas y Equipos Industriales",
              weekly_hours: 0,
              total_hours: 4,
              regulares: [],
              aprobadas: [],
              isElectiva: true
            }
    ]
  }
};