# /add-tuning

Add a new tuning preset to the tuner app.

## Usage

`/add-tuning <instrument> "<name>" <strings> "<description>"`

Example: `/add-tuning guitar "Open C" C2 G2 C3 G3 C4 E4 "Rich open major sound, common in fingerstyle and folk"`

## Steps

1. Parse the instrument, name, strings (low→high), and description from the args
2. Spawn the `tuning-curator` agent to validate the preset against the schema and check for duplicates
3. Add the new preset object to the correct instrument array in `src/data/tunings.ts`
4. Confirm the addition and show the final preset object
