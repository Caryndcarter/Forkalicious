import { runP2PTests } from "./p2p.cy";
import runUnitTests from "./unitTests.cy";

export default function runTests(){
    runP2PTests();
    runUnitTests();
}

// runTests();