export function getUnique<T>(
  data: T[] | undefined,
  accessor: (item: T) => string | undefined,
  missing = '',
): string[] {
  return [
    ...(data ?? []).reduce(
      (set, template) => set.add(accessor(template) ?? missing),
      new Set<string>(),
    ),
  ]
}
