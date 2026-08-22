import { useState } from 'react';

export default function useConfirm() {
    const [config, setConfig] = useState(null);

    const confirm = ({ titulo, mensaje, variante = 'danger' }) => {
        return new Promise((resolve) => {
            setConfig({
                titulo,
                mensaje,
                variante,
                onConfirmar: () => {
                    setConfig(null);
                    resolve(true);
                },
                onCancelar: () => {
                    setConfig(null);
                    resolve(false);
                },
            });
        });
    };

    return { confirm, config };
}