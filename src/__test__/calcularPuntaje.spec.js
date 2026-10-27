const { calcularPuntaje } = require('../calcularPuntaje.js');

describe('lista de test de calcularPuntaje', () => {
    it('debe devolver 80 cuando se pasa cualquier aciertos', () => {
        expect(calcularPuntaje(3)).toBe(80);
    });
});
