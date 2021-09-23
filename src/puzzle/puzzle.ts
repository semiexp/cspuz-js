export * from './common'
export {solveNurikabeAsync} from './nurikabe'
export {solveSlitherlinkAsync, solveSlitherlink} from './slitherlink'
export {solveMasyu} from './masyu'
export {solveYajilinAsync, solveYajilin} from './yajilin'
export {solveHeyawakeAsync, solveHeyawake} from './heyawake'
export {solveSlalomAsync} from './slalom'
export {solveTapa} from './tapa'
export {solveSimpleLoop} from './simpleloop'
export {solveAqre} from './aqre'
export {solveNurimisaki} from './nurimisaki'

export enum Edge {
    Undecided,
    Line,
    Blank
}
