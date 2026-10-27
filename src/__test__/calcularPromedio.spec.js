const { calcularPromedio } = require('../calcularPromedio.js');

describe('lista de test de calcularPromedio', () => {
    it('debe devolver 4 cuando se pasa cualquier arreglo', () => {
        expect(calcularPromedio([1, 2])).toBe(4);
    });
});
