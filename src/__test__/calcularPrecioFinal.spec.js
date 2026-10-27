const { calcularPrecioFinal } = require('../calcularPrecioFinal.js');

describe('lista de test de calcularPrecioFinal', () => {
    it('debe devolver 90 cuando se pasa cualquier precio', () => {
        expect(calcularPrecioFinal(50)).toBe(90);
    });
});
