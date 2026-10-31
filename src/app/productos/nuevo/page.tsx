'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/app/lib/firebase';

const subcategoriasPorCategoria: Record<string, string[]> = {
  organicos: [
    'Espejos Orgánicos Asimétricos',
    'Espejos de Curvas Suaves',
    'Diseños de Autor'
  ],
  arqueados: [
    'Arqueados Estilo Ventana',
    'Arqueados de Pared',
    'Arcos Monumentales'
  ],
  pie: [
    'Cuerpo Entero con Soporte',
    'Espejos Vestidores',
    'De Pie con Marco Metálico'
  ],
  pared: [
    'Espejos Redondos y Ovalados',
    'Espejos Rectangulares',
    'Espejos Biselados sin Marco',
    'Espejos Decorativos / Consola'
  ]
};

export default function NuevoProductoPage() {
  const router = useRouter();
  
  // 1. Campos Básicos y Categorías Múltiples
  const [nombre, setNombre] = useState('');
  const [categorias, setCategorias] = useState<string[]>(['organicos']);
  const [subcategoria, setSubcategoria] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // 2. Medidas y Especificaciones de Cristalería / Marcos
  const [alto, setAlto] = useState('');
  const [ancho, setAncho] = useState('');
  const [profundidad, setProfundidad] = useState('');
  const [cristal, setCristal] = useState('');
  const [marco, setMarco] = useState('');
  const [montaje, setMontaje] = useState('');

  // 3. Información Editorial Estilo Zara Home
  const [composicionDelantera, setComposicionDelantera] = useState('100% vidrio');
  const [composicionTrasera, setComposicionTrasera] = useState('100% fibra madera de densidad media y espesor');
  const [origen, setOrigen] = useState('Hecho en India');
  const [peso, setPeso] = useState('3.00 kg');
  const [politicaEnvio, setPoliticaEnvio] = useState(
    'ESTÁNDAR: 14.900 COP. En 24 horas para pedidos con destino a las principales ciudades. (48/72 horas para zonas remotas) – Gratis para pedidos superiores a 400.000 COP.'
  );
  const [disponibilidadTienda, setDisponibilidadTienda] = useState(
    'El stock es orientativo. Para más información consulta con tienda.'
  );

  // 4. Archivos de Imagen y Previsualizaciones
  const [imagenPrincipalFile, setImagenPrincipalFile] = useState<File | null>(null);
  const [previewPrincipal, setPreviewPrincipal] = useState<string | null>(null);

  const [imagenesAmbientesFiles, setImagenesAmbientesFiles] = useState<File[]>([]);
  const [previewsAmbientes, setPreviewsAmbientes] = useState<string[]>([]);

  const [cargando, setCargando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState('');

  const inputEstilo = "w-full border border-[#EAE7E1] rounded-xl p-3 text-sm text-[#111111] font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#8C8275] bg-white";
  const inputPequenoEstilo = "w-full border border-[#EAE7E1] rounded-lg p-2.5 text-sm text-[#111111] font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#8C8275] bg-white";

  // Manejador para toggle de categorías múltiples
  const toggleCategoria = (catId: string) => {
    setCategorias((prev) => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // Mantener al menos una
        return prev.filter((item) => item !== catId);
      }
      return [...prev, catId];
    });
  };

  // Actualizar subcategorías en base a la primera categoría seleccionada
  useEffect(() => {
    const primeraCat = categorias[0] || 'organicos';
    const subs = subcategoriasPorCategoria[primeraCat] || [];
    setSubcategoria(subs[0] || '');
  }, [categorias]);

  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenPrincipalFile(file);
      setPreviewPrincipal(URL.createObjectURL(file));
    }
  };

  const handleAmbientesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImagenesAmbientesFiles((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewsAmbientes((prev) => [...prev, ...newPreviews]);
    }
  };

  const eliminarFotoAmbiente = (index: number) => {
    setImagenesAmbientesFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewsAmbientes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imagenPrincipalFile) {
      alert('Por favor selecciona la imagen principal del espejo.');
      return;
    }

    if (!subcategoria) {
      alert('Por favor selecciona una subcategoría.');
      return;
    }

    try {
      setCargando(true);
      setMensajeEstado('Subiendo foto principal...');

      const mainStorageRef = ref(storage, `espejos/principal_${Date.now()}_${imagenPrincipalFile.name}`);
      await uploadBytes(mainStorageRef, imagenPrincipalFile);
      const urlPrincipal = await getDownloadURL(mainStorageRef);

      const urlsAmbientes: string[] = [];
      if (imagenesAmbientesFiles.length > 0) {
        setMensajeEstado(`Subiendo ${imagenesAmbientesFiles.length} fotos de galería...`);
        for (let i = 0; i < imagenesAmbientesFiles.length; i++) {
          const file = imagenesAmbientesFiles[i];
          const ambStorageRef = ref(storage, `espejos/ambientes_${Date.now()}_${file.name}`);
          await uploadBytes(ambStorageRef, file);
          const urlAmb = await getDownloadURL(ambStorageRef);
          urlsAmbientes.push(urlAmb);
        }
      }

      const objetoMedidas = {
        alto: alto.trim(),
        ancho: ancho.trim(),
        profundidad: profundidad.trim(),
      };

      const objetoMateriales = {
        estructura: cristal.trim(),
        tapiz: marco.trim(),
        patas: montaje.trim(),
      };

      const objetoEditorial = {
        composicion: {
          delantera: composicionDelantera.trim(),
          trasera: composicionTrasera.trim(),
        },
        origen: origen.trim(),
        peso: peso.trim(),
        envio: politicaEnvio.trim(),
        disponibilidad: disponibilidadTienda.trim(),
      };

      setMensajeEstado('Guardando espejo en el catálogo...');
      await addDoc(collection(db, 'productos'), {
        nombre: nombre.trim(),
        categorias: categorias, // Array de categorías múltiples
        categoria: categorias[0] || 'organicos', // Campo base por compatibilidad
        subcategoria: subcategoria.trim(),
        precio: Number(precio),
        descripcion: descripcion.trim() || '',
        medidas: objetoMedidas,
        materiales: objetoMateriales,
        editorial: objetoEditorial,
        imagen: urlPrincipal,
        imagenes: urlsAmbientes.length > 0 ? urlsAmbientes : [urlPrincipal],
        creadoEn: serverTimestamp(),
      });

      alert('¡Espejo publicado con éxito en la colección!');
      router.push('/');
    } catch (error) {
      console.error('Error al guardar el espejo:', error);
      alert('Ocurrió un error al intentar guardar el espejo.');
    } finally {
      setCargando(false);
      setMensajeEstado('');
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex items-center justify-between mb-8 border-b border-[#EAE7E1] pb-6">
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#8C8275] block font-sans">
              ADMINISTRACIÓN DE COLECCIÓN
            </span>
            <h1 className="font-serif text-3xl text-[#111111]">Agregar Nuevo Espejo</h1>
          </div>
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-[#8C8275] hover:text-[#111111] font-medium transition-colors"
          >
            ← Volver al Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-[#EAE7E1] shadow-sm space-y-8">
          
          {/* 1. INFORMACIÓN PRINCIPAL & CATEGORÍAS */}
          <div className="space-y-6">
            <h2 className="font-serif text-lg text-[#111111] border-b border-[#EAE7E1] pb-2">
              1. Información Principal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#111111] mb-2 font-semibold">
                  Nombre del Espejo *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Espejo Pared Biselado Rectangular"
                  className={inputEstilo}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#111111] mb-2 font-semibold">
                  Precio ($ COP) *
                </label>
                <input
                  type="number"
                  required
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="Ej. 489000"
                  className={inputEstilo}
                />
              </div>
            </div>

            {/* SELECCIÓN MÚLTIPLE DE CATEGORÍAS */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#111111] mb-2 font-semibold">
                Categorías (Puedes seleccionar una o varias) *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'organicos', label: 'Orgánicos' },
                  { id: 'arqueados', label: 'Arqueados' },
                  { id: 'pie', label: 'De Pie' },
                  { id: 'pared', label: 'De Pared' },
                ].map((cat) => {
                  const estaSeleccionado = categorias.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategoria(cat.id)}
                      className={`py-3 px-4 rounded-xl border text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                        estaSeleccionado
                          ? 'border-[#111111] bg-[#111111] text-[#FAF9F6]'
                          : 'border-[#EAE7E1] bg-white text-[#8C8275] hover:border-[#8C8275]'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span>{estaSeleccionado ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

   
          </div>

          {/* 2. FOTOGRAFÍA E IMÁGENES */}
          <div className="space-y-6 pt-4 border-t border-[#EAE7E1]">
            <h2 className="font-serif text-lg text-[#111111] border-b border-[#EAE7E1] pb-2">
              2. Fotografía e Imágenes (Aspect Ratio 3:4)
            </h2>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#111111] mb-3 font-semibold">
                Foto Principal (Portada del catálogo) *
              </label>

              <div className="flex items-center gap-6">
                <label className="relative flex flex-col items-center justify-center w-40 h-52 bg-[#FAF9F6] rounded-2xl border-2 border-dashed border-[#EAE7E1] hover:border-[#8C8275] cursor-pointer transition-colors overflow-hidden flex-shrink-0">
                  {previewPrincipal ? (
                    <Image
                      src={previewPrincipal}
                      alt="Preview Principal"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-2xl block mb-1">🪞</span>
                      <span className="text-[11px] text-[#8C8275] font-sans uppercase tracking-wider font-medium">
                        Seleccionar
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePrincipalChange}
                    className="hidden"
                  />
                </label>

                {previewPrincipal && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagenPrincipalFile(null);
                      setPreviewPrincipal(null);
                    }}
                    className="text-xs text-red-600 hover:underline uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    Cambiar foto
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#111111] mb-3 font-semibold">
                Galería de Ambientes (Imágenes adicionales)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {previewsAmbientes.map((prevUrl, idx) => (
                  <div key={idx} className="relative w-full h-36 rounded-xl overflow-hidden border border-[#EAE7E1] group bg-[#FAF9F6]">
                    <Image
                      src={prevUrl}
                      alt={`Ambiente ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarFotoAmbiente(idx)}
                      className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <label className="flex flex-col items-center justify-center w-full h-36 bg-[#FAF9F6] rounded-xl border-2 border-dashed border-[#EAE7E1] hover:border-[#8C8275] cursor-pointer transition-colors">
                  <span className="text-2xl text-[#8C8275] mb-1">+</span>
                  <span className="text-[10px] text-[#8C8275] uppercase tracking-wider font-medium">Agregar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAmbientesChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 3. DETALLES Y ESPECIFICACIONES TÉCNICAS */}
          <div className="space-y-6 pt-4 border-t border-[#EAE7E1]">
            <h2 className="font-serif text-lg text-[#111111] border-b border-[#EAE7E1] pb-2">
              3. Especificaciones Técnicas y Medidas
            </h2>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#111111] mb-2 font-semibold">
                Descripción Editorial
              </label>
              <textarea
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Espejo de pared en vidrio con formato rectangular y esquinas achaflanadas..."
                className={inputEstilo}
              />
            </div>

            {/* Medidas */}
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#EAE7E1] space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-[#111111] font-bold">
                Dimensiones (Medidas Principales)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8C8275] font-medium mb-1">Alto</label>
                  <input
                    type="text"
                    value={alto}
                    onChange={(e) => setAlto(e.target.value)}
                    placeholder="Ej. 70 cm"
                    className={inputPequenoEstilo}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8C8275] font-medium mb-1">Ancho</label>
                  <input
                    type="text"
                    value={ancho}
                    onChange={(e) => setAncho(e.target.value)}
                    placeholder="Ej. 50 cm"
                    className={inputPequenoEstilo}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8C8275] font-medium mb-1">Grosor / Fondo</label>
                  <input
                    type="text"
                    value={profundidad}
                    onChange={(e) => setProfundidad(e.target.value)}
                    placeholder="Ej. 2 cm"
                    className={inputPequenoEstilo}
                  />
                </div>
              </div>
            </div>

            {/* Materiales y Acabados */}
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#EAE7E1] space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-[#111111] font-bold">
                Cristal, Marco y Montaje
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8C8275] font-medium mb-1">Tipo de Cristal</label>
                  <input
                    type="text"
                    value={cristal}
                    onChange={(e) => setCristal(e.target.value)}
                    placeholder="Ej. Cristal flotado HD 5mm"
                    className={inputPequenoEstilo}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8C8275] font-medium mb-1">Marco / Borde</label>
                  <input
                    type="text"
                    value={marco}
                    onChange={(e) => setMarco(e.target.value)}
                    placeholder="Ej. Canto biselado"
                    className={inputPequenoEstilo}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8C8275] font-medium mb-1">Sistema de Montaje</label>
                  <input
                    type="text"
                    value={montaje}
                    onChange={(e) => setMontaje(e.target.value)}
                    placeholder="Ej. Anclajes traseros"
                    className={inputPequenoEstilo}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* 4. INFORMACIÓN EDITORIAL (ZARA HOME STYLE) */}
          <div className="space-y-6 pt-4 border-t border-[#EAE7E1]">
            <h2 className="font-serif text-lg text-[#111111] border-b border-[#EAE7E1] pb-2">
              4. Composición, Cuidados, Origen & Envíos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#111111] mb-2 font-semibold">
                  Composición Delantera
                </label>
                <input
                  type="text"
                  value={composicionDelantera}
                  onChange={(e) => setComposicionDelantera(e.target.value)}
                  placeholder="Ej. 100% vidrio"
                  className={inputEstilo}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#111111] mb-2 font-semibold">
                  Composición Trasera
                </label>
                <input
                  type="text"
                  value={composicionTrasera}
                  onChange={(e) => setComposicionTrasera(e.target.value)}
                  placeholder="Ej. 100% fibra madera de densidad media"
                  className={inputEstilo}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#111111] mb-2 font-semibold">
                  Origen de Fabricación
                </label>
                <input
                  type="text"
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  placeholder="Ej. Hecho en India"
                  className={inputEstilo}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#111111] mb-2 font-semibold">
                  Peso Estimado
                </label>
                <input
                  type="text"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ej. 4.00 kg"
                  className={inputEstilo}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#111111] mb-2 font-semibold">
                Información de Envío & Devolución
              </label>
              <textarea
                rows={3}
                value={politicaEnvio}
                onChange={(e) => setPoliticaEnvio(e.target.value)}
                className={inputEstilo}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#111111] mb-2 font-semibold">
                Disponibilidad en Tienda
              </label>
              <input
                type="text"
                value={disponibilidadTienda}
                onChange={(e) => setDisponibilidadTienda(e.target.value)}
                className={inputEstilo}
              />
            </div>
          </div>

          {mensajeEstado && (
            <p className="text-xs font-semibold text-[#8C8275] bg-[#FAF9F6] p-3 rounded-xl border border-[#EAE7E1] text-center animate-pulse">
              ⏳ {mensajeEstado}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#111111] text-[#FAF9F6] hover:bg-[#8C8275] transition-colors py-4 rounded-xl text-xs uppercase tracking-widest font-semibold disabled:bg-gray-400 cursor-pointer shadow-sm"
          >
            {cargando ? 'Guardando Espejo...' : 'Publicar Espejo en la Colección'}
          </button>
        </form>

      </div>
    </main>
  );
}