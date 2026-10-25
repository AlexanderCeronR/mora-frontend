import { useRef, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ANCHO = 76;
const PERILLA = 30;
const PADDING = 3;
const RECORRIDO = ANCHO - PERILLA - PADDING * 2;

export default function ThemeSwitch() {
    const { theme, setTheme } = useTheme();
    const claro = theme === 'light';

    const [arrastre, setArrastre] = useState(null); // posición en px mientras se arrastra
    const inicio = useRef(null);
    const seMovio = useRef(false);

    const posicionReposo = claro ? RECORRIDO : 0;
    const posicion = arrastre !== null ? arrastre : posicionReposo;

    const onPointerDown = (e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        inicio.current = { x: e.clientX, pos: posicionReposo };
        seMovio.current = false;
        setArrastre(posicionReposo);
    };

    const onPointerMove = (e) => {
        if (!inicio.current) return;
        const delta = e.clientX - inicio.current.x;
        if (Math.abs(delta) > 3) seMovio.current = true;
        const nueva = Math.min(RECORRIDO,
            Math.max(0, inicio.current.pos + delta));
        setArrastre(nueva);
    };

    const onPointerUp = () => {
        if (!inicio.current) return;
        if (seMovio.current) {
            // Se arrastró: decide por la mitad del recorrido
            setTheme(arrastre > RECORRIDO / 2 ? 'light' : 'dark');
        } else {
            // Solo un clic: alterna
            setTheme(claro ? 'dark' : 'light');
        }
        inicio.current = null;
        setArrastre(null);
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowRight') setTheme('light');
        if (e.key === 'ArrowLeft') setTheme('dark');
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setTheme(claro ? 'dark' : 'light');
        }
    };

    // Fondo: se va aclarando según la posición de la perilla
    const progreso = posicion / RECORRIDO;

    return (
        <div
            role="switch"
            aria-checked={claro}
            aria-label="Cambiar entre modo oscuro y claro"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
                position: 'relative',
                width: ANCHO,
                height: PERILLA + PADDING * 2,
                borderRadius: 999,
                border: '1px solid var(--border-default)',
                backgroundColor: `rgb(${Math.round(26 + 229 * progreso)},
                    ${Math.round(26 + 229 * progreso)},
                    ${Math.round(38 + 217 * progreso)})`,
                cursor: arrastre !== null ? 'grabbing' : 'grab',
                touchAction: 'none',
                userSelect: 'none',
                flexShrink: 0,
                transition: arrastre !== null
                    ? 'none' : 'background-color 0.3s ease',
            }}>
            {/* Íconos de fondo */}
            <Moon size={14} color={claro ? '#737373' : '#f0f0ff'}
                style={{ position: 'absolute', left: 10, top: 9,
                    opacity: 1 - progreso * 0.6 }} />
            <Sun size={14} color={claro ? '#000000' : '#a0a0c0'}
                style={{ position: 'absolute', right: 10, top: 9,
                    opacity: 0.4 + progreso * 0.6 }} />

            {/* Perilla */}
            <div style={{
                position: 'absolute',
                top: PADDING - 1,
                left: PADDING - 1 + posicion,
                width: PERILLA,
                height: PERILLA,
                borderRadius: '50%',
                backgroundColor: progreso > 0.5 ? '#000000' : '#f0f0ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                transition: arrastre !== null
                    ? 'none'
                    : 'left 0.3s cubic-bezier(.4,1.4,.6,1), background-color 0.3s ease',
            }}>
                {progreso > 0.5
                    ? <Sun size={16} color="#ffffff" />
                    : <Moon size={16} color="#09090f" />}
            </div>
        </div>
    );
}