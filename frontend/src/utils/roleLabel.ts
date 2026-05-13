export function getRoleLabel(role?: string | null): string {
  if (!role) {
    return 'Sin rol'
  }

  const roleLabels: Record<string, string> = {
    Admin: 'Administrador',
    Coordinator: 'Coordinador',
    Leader: 'Líder',
    Participant: 'Participante',
  }

  return roleLabels[role] ?? role
}