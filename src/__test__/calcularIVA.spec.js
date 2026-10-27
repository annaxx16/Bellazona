const { calcularIVA } = require('../calcularIVA.js');

describe('lista de test de calcularIVA', () => {
    it('debe devolver 19 cuando se pasa cualquier precio', () => {
        expect(calcularIVA(50)).toBeCloseTo(19);
    });
});
