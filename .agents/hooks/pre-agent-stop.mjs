import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

function getProjectRoot({ spawn = spawnSync } = {}) {
    const result = spawn("git", ["rev-parse", "--show-toplevel"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
    })

    if (result.status !== 0) return process.cwd()
        
    return result.stdout.trim()
}

function getFailureOutput({ result }) {
    const output = [result.stdout, result.stderr]
        .filter(value => value?.trim())
        .join("\n")
        .trim()

    if (output) return output
    if (result.error) return result.error.message
    if (result.signal) return `The hook was terminated by signal ${result.signal}.`

    return `The hook exited with status ${result.status ?? "unknown"}.`
}

function getStopDecision({ output }) {
    return {
        decision: "block",
        reason: [
            "pre-agent-stop failed. Resolve every reported error before ending this turn.",
            "Run the relevant checks again after making the fix.",
            "Hook output:",
            output
        ].join("\n")
    }
}

function runPreAgentStop({ spawn = spawnSync } = {}) {
    const result = spawn("pnpm", ["exec", "lefthook", "run", "pre-agent-stop", "--no-tty"], {
        cwd: getProjectRoot({ spawn }),
        encoding: "utf8",
        env: {
            ...process.env,
            LEFTHOOK_OUTPUT: "false",
            NO_COLOR: "true"
        },
        stdio: ["ignore", "pipe", "pipe"]
    })

    if (result.status === 0) return null

    return getStopDecision({ output: getFailureOutput({ result }) })
}

function main() {
    const decision = runPreAgentStop()
    if (decision) process.stdout.write(JSON.stringify(decision))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
