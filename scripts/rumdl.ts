import { spawnSync } from "node:child_process";

/*
	On Windows, call the installed binary. The npm shim evaluates every platform entry while building its map,
	which runs Git's `ldd`, and that `ldd` aborts.
*/
const executableForPlatform = (platform: NodeJS.Platform): string => {
	if (platform === "win32") {
		return "node_modules/@rumdl/cli-win32-x64/rumdl.exe";
	}

	return "rumdl";
};

const [, , ...rumdlArguments] = process.argv;
const result = spawnSync(executableForPlatform(process.platform), ["check", ".", ...rumdlArguments], {
	stdio: "inherit",
});

if (result.error) {
	throw result.error;
}

process.exitCode = result.status ?? 1;
