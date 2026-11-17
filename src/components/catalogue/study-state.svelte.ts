export const studyState = $state({
    studies: [] as string[],
    alias: [] as string[],
    activeButton: [] as boolean[],
});
const colorTable = ["blue", "green", "red", "orange"];

export function addStudy(name: string, alias?: string): void {
    studyState.studies.push(name);
    const al = alias ? alias : studyState.studies.length.toString();
    studyState.alias.push(al);
    studyState.activeButton.push(true);
}
export function addStudies(names: string[]): void {
    names.forEach((name) => {
        addStudy(name);
    });
}

export function getSelectedStudies(): string[] {
    return studyState.studies.filter(
        (_, index) => studyState.activeButton[index] === true,
    );
}
export function getCohortParam(cohort: string): {
    name: string;
    color: string;
} {
    let param = { name: "", color: "" };
    studyState.studies.forEach((studie, index) => {
        if (cohort === studie) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            getSelectedStudies().includes(studie)
                ? (param = {
                      name: studyState.alias[index],
                      color: colorTable[index],
                  })
                : (param = {
                      name: studyState.alias[index],
                      color: "lightgrey",
                  });
        }
    });
    return param;
}
