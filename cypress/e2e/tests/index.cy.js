import { runP2PTests } from "./p2p.cy";
import runMakerTests from "./maker-tests.cy";
import runEditTests from "./edit-tests.cy";

export default function runTests(){
    runP2PTests();
    runMakerTests();
    runEditTests();
}
