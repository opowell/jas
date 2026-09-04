# Taking over the screen

This Mac runs automated sessions in several repositories at the same time, and
they share one screen, one pointer and one keyboard. Anything that drives a
browser, moves the mouse, types keystrokes or brings a window to the front has
to take the shared screen lock first, or it will fight both the person sitting
at the machine and whatever another session is doing:

```
~/.claude/bin/screen-busy.sh run --message "what you are doing" -- <command>
```

`run` takes the lock, raises a marker (a solid red bar across the top of every
display, captioned with what is going on and for how long), runs the command,
and releases on every exit path — a failing command and Ctrl-C included. Use
`start` / `stop` when the work spans several commands, such as opening a page,
poking at it and closing it again; `stop` is then not optional, because the
marker is what tells the user the machine is theirs again. `pause` / `resume`
hide the marker around a screenshot so it does not land in the capture.

An owner is a worktree root, so this repo and any other contend as separate
parties. When another session holds the lock, `start` and `run` refuse with
exit status 3 instead of stealing it; queue behind the holder with
`--wait SECONDS` rather than giving up:

```
~/.claude/bin/screen-busy.sh run --wait 900 --message "..." -- <command>
```

`--force` overrides a live holder, and is for the person at the keyboard — an
agent that hits a refusal should wait. A `PreToolUse` hook also refuses
screen-taking commands (`osascript` with keystrokes or clicks, `cliclick`,
`screencapture`, browser-driving MCP tools) while another session holds the
lock, so this is enforced whether or not the command was wrapped.

The marker clears itself after `--timeout` seconds (30 minutes by default), so
a session that dies mid-run cannot leave the screen locked forever — a command
expected to run longer needs a bigger `--timeout`.
