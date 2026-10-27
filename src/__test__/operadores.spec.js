const { anum } = require('../operadores.js');

describe('lista de test de operadores', () => {
    it('debe devolver -6 cuando se pasa 3', () => {
        expect(anum(3)).toBe(-6);
    });
});
