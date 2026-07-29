'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

interface Asignacion {
  id: string;
  test: {
    id: string;
    nombre: string;
    descripcion: string;
    duracion_minutos: number;
    calificacion_minima: number;
    instrucciones: string;
  };
  candidato: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

interface Pregunta {
  id: string;
  texto: string;
  tipo: string;
  opciones: Array<{ texto: string; puntos: number }>;
  competencia: string;
}

export default function TestPublicPage({ params }: PageProps) {
  const supabase = createClient();
  const [asignacion, setAsignacion] = useState<Asignacion | null>(null);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function loadData() {
    const { data: asignacionData, error } = await supabase
      .from('cst_test_asignaciones')
      .select(`
        *,
        test:cst_test_competencias(*),
        candidato:cst_candidatos(*)
      `)
      .eq('id', params.id)
      .single();

    if (error || !asignacionData) {
      notFound();
      return;
    }

    setAsignacion(asignacionData);

    const { data: preguntasData } = await supabase
      .from('cst_test_preguntas')
      .select('*')
      .eq('test_id', asignacionData.test_id)
      .order('orden', { ascending: true });

    // Aleatorizar preguntas
    const shuffled = preguntasData ? [...preguntasData].sort(() => Math.random() - 0.5) : [];
    setPreguntas(shuffled);
    setLoading(false);
  }

  function handleRespuesta(preguntaId: string, puntos: number) {
    setRespuestas(prev => ({ ...prev, [preguntaId]: puntos }));
  }

  async function handleSubmit() {
    if (!asignacion) return;
    
    setEnviando(true);

    const resultados = Object.entries(respuestas).map(([preguntaId, puntos]) => ({
      asignacion_id: asignacion.id,
      pregunta_id: preguntaId,
      respuesta: null,
      puntos_obtenidos: puntos,
    }));

    await supabase.from('cst_test_resultados').insert(resultados);

    const totalPuntos = Object.values(respuestas).reduce((a, b) => a + b, 0);
    const maxPuntos = preguntas.length * 5;
    const porcentaje = Math.round((totalPuntos / maxPuntos) * 100);

    await supabase
      .from('cst_test_asignaciones')
      .update({
        estado: 'completado',
        fecha_completado: new Date().toISOString(),
      })
      .eq('id', asignacion.id);

    alert(`Test completado. Puntaje: ${porcentaje}%`);
    setEnviando(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Cargando test...</div>
      </div>
    );
  }

  if (!asignacion) {
    notFound();
  }

  const progreso = (Object.keys(respuestas).length / preguntas.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{asignacion.test.nombre}</h1>
              <p className="text-sm text-slate-500">{asignacion.candidato.nombre} {asignacion.candidato.apellido}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                <span className="font-semibold">{asignacion.test.duracion_minutos}</span> minutos
              </div>
              <div className="text-sm text-slate-600">
                Mínimo: <span className="font-semibold">{asignacion.test.calificacion_minima}%</span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
              <span>Progreso</span>
              <span>{Math.round(progreso)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Instrucciones</h2>
          <p className="text-slate-600">
            {asignacion.test.instrucciones || 'Responde todas las preguntas de manera honesta. No hay respuestas correctas o incorrectas, solo tu perspectiva profesional.'}
          </p>
        </div>

        <div className="space-y-6">
          {preguntas.map((pregunta, index) => (
            <div key={pregunta.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-slate-900 font-medium mb-4">
                <span className="text-emerald-600 font-bold">{index + 1}.</span> {pregunta.texto}
              </p>
              
              <div className="space-y-3">
                {pregunta.tipo === 'opcion_multiple' && pregunta.opciones && (
                  pregunta.opciones.map((opcion, oIndex) => (
                    <label 
                      key={oIndex} 
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        respuestas[pregunta.id] === opcion.puntos 
                          ? 'bg-emerald-50 border-2 border-emerald-600' 
                          : 'hover:bg-slate-50 border-2 border-transparent'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`pregunta_${pregunta.id}`}
                        value={opcion.puntos}
                        checked={respuestas[pregunta.id] === opcion.puntos}
                        onChange={() => handleRespuesta(pregunta.id, opcion.puntos)}
                        className="mt-1"
                      />
                      <span className="text-slate-600">{opcion.texto}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={Object.keys(respuestas).length < preguntas.length || enviando}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {enviando ? 'Enviando...' : 'Enviar Respuestas'}
          </button>
        </div>
      </div>
    </div>
  );
}
