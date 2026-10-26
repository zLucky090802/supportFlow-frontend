export type ArticleStatus = 'Publicado' | 'Borrador';
export interface Article {readonly id:string;readonly title:string;readonly category:string;readonly status:ArticleStatus;readonly updated:string;readonly content:string;}
export const CATEGORIES=['Información general','Cuenta y acceso','Guías','Facturación'] as const;
export const ARTICLES:readonly Article[]=[
  {
    "id": "0",
    "title": "Horarios de atención",
    "category": "Información general",
    "status": "Publicado",
    "updated": "Hoy, 9:30 a. m.",
    "content": "Nuestro equipo atiende de lunes a viernes, de 8:00 a. m. a 6:00 p. m. (hora de Bogotá).\n\nFuera de este horario, puedes dejar tu consulta. El equipo la revisará en su siguiente jornada."
  },
  {
    "id": "1",
    "title": "Cómo recuperar tu acceso",
    "category": "Cuenta y acceso",
    "status": "Publicado",
    "updated": "Ayer, 3:10 p. m.",
    "content": "Selecciona «Olvidé mi contraseña» en el inicio de sesión. Sigue las instrucciones del correo de recuperación.\n\nNo compartas tu contraseña con el equipo de soporte."
  },
  {
    "id": "2",
    "title": "Canales de contacto",
    "category": "Información general",
    "status": "Publicado",
    "updated": "21 oct, 11:20 a. m.",
    "content": "Puedes escribirnos por los canales habilitados de soporte. Un integrante del equipo atenderá tu solicitud."
  },
  {
    "id": "3",
    "title": "Primeros pasos",
    "category": "Guías",
    "status": "Publicado",
    "updated": "20 oct, 4:00 p. m.",
    "content": "Completa tu perfil y revisa la guía de bienvenida. Si necesitas ayuda, escribe al equipo de soporte."
  },
  {
    "id": "4",
    "title": "Preguntas sobre facturación",
    "category": "Facturación",
    "status": "Borrador",
    "updated": "Hoy, 10:15 a. m.",
    "content": "Contenido en revisión. Confirma las condiciones de facturación antes de publicar este artículo."
  },
  {
    "id": "5",
    "title": "Cambiar datos de la cuenta",
    "category": "Cuenta y acceso",
    "status": "Borrador",
    "updated": "Ayer, 2:00 p. m.",
    "content": "Contenido en revisión. Describe los pasos para actualizar los datos de la cuenta."
  }
];

