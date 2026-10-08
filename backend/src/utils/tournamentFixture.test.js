import test from "node:test";
import assert from "node:assert/strict";
import { createCupRound, createLeagueFixture } from "./tournamentFixture.js";

test("la liga simple programa cada cruce una vez y registra descansos si hay impares", () => {
    const even = createLeagueFixture([1, 2, 3, 4], "2026-11-01", 3);
    assert.equal(even.fixtures.length, 6);
    assert.equal(even.byes.length, 0);
    assert.equal(new Set(even.fixtures.map(({ equipoLocalId, equipoVisitanteId }) =>
        [equipoLocalId, equipoVisitanteId].sort((a, b) => a - b).join("-"),
    )).size, 6);
    assert.deepEqual(even.fixtures.slice(0, 3).map(({ fecha }) => fecha), [
        "2026-11-01",
        "2026-11-04",
        "2026-11-07",
    ]);

    const odd = createLeagueFixture([1, 2, 3], "2026-11-01", 7);
    assert.equal(odd.fixtures.length, 3);
    assert.equal(odd.byes.length, 3);
    assert.equal(new Set(odd.byes.map(({ equipoId }) => equipoId)).size, 3);
});

test("la copa sortea pases para completar la llave y arma partidos de primera ronda", () => {
    const fixture = createCupRound([1, 2, 3, 4, 5], "2026-11-01", 7, () => 0);
    assert.equal(fixture.byes.length, 3);
    assert.equal(fixture.fixtures.length, 1);
    assert.equal(
        new Set([
            ...fixture.byes.map(({ equipoId }) => equipoId),
            ...fixture.fixtures.flatMap(({ equipoLocalId, equipoVisitanteId }) => [
                equipoLocalId,
                equipoVisitanteId,
            ]),
        ]).size,
        5,
    );
    assert.equal(fixture.fixtures[0].fecha, "2026-11-01");
});
