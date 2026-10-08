function addDays(date, days) {
    const value = new Date(`${date}T00:00:00.000Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
}

function nextPowerOfTwo(value) {
    return 2 ** Math.ceil(Math.log2(value));
}

export function createLeagueFixture(teamIds, startDate, intervalDays) {
    const rotation = [...teamIds];
    if (rotation.length % 2 === 1) rotation.push(null);
    const fixtures = [];
    const byes = [];
    let matchIndex = 0;

    for (let roundIndex = 0; roundIndex < rotation.length - 1; roundIndex += 1) {
        for (let pairIndex = 0; pairIndex < rotation.length / 2; pairIndex += 1) {
            const home = rotation[pairIndex];
            const away = rotation[rotation.length - 1 - pairIndex];
            if (home === null || away === null) {
                byes.push({
                    ronda: roundIndex + 1,
                    equipoId: home ?? away,
                });
                continue;
            }
            fixtures.push({
                ronda: roundIndex + 1,
                fecha: addDays(startDate, matchIndex * intervalDays),
                equipoLocalId: home,
                equipoVisitanteId: away,
            });
            matchIndex += 1;
        }

        const fixed = rotation[0];
        const moving = rotation.slice(1);
        rotation.splice(0, rotation.length, fixed, moving.at(-1), ...moving.slice(0, -1));
    }

    return { fixtures, byes };
}

export function createCupRound(teamIds, startDate, intervalDays, random = Math.random) {
    const draw = [...teamIds];
    for (let index = draw.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [draw[index], draw[swapIndex]] = [draw[swapIndex], draw[index]];
    }

    const byeCount = nextPowerOfTwo(draw.length) - draw.length;
    const byes = draw.slice(0, byeCount).map((equipoId) => ({ ronda: 1, equipoId }));
    const playing = draw.slice(byeCount);
    const fixtures = [];
    for (let index = 0; index < playing.length; index += 2) {
        fixtures.push({
            ronda: 1,
            fecha: addDays(startDate, fixtures.length * intervalDays),
            equipoLocalId: playing[index],
            equipoVisitanteId: playing[index + 1],
        });
    }
    return { fixtures, byes };
}

export function addFixtureDays(date, days) {
    return addDays(date, days);
}
