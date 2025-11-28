import { useState } from 'react';
import { Users, Monitor, FileText, Clock, Plus } from 'lucide-react';
import type { PasswordType, Password } from './types/password.types';
import type { QueueStats } from './types/queue.types';
import { generatePasswordNumber } from './utils/general.utils';

export const App = () => {
  const [view, setView] = useState<'totem' | 'panel' | 'attendant' | 'reports'>('totem');
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [sequences, setSequences] = useState({ SP: 1, SG: 1, SE: 1 });
  const [lastCalledType, setLastCalledType] = useState<PasswordType | null>(null);
  const [recentCalls, setRecentCalls] = useState<Password[]>([]);
  const [currentCounter, setCurrentCounter] = useState<number>(1);
  const [stats, setStats] = useState<QueueStats>({
    totalIssued: 0,
    totalAttended: 0,
    byType: {
      SP: { issued: 0, attended: 0 },
      SG: { issued: 0, attended: 0 },
      SE: { issued: 0, attended: 0 }
    }
  });

  const issuePassword = (type: PasswordType) => {
    const newPassword: Password = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      number: generatePasswordNumber(type, sequences[type]),
      issuedAt: new Date(),
      status: 'waiting'
    };

    setPasswords(prev => [...prev, newPassword]);
    setSequences(prev => ({ ...prev, [type]: prev[type] + 1 }));
    setStats(prev => ({
      ...prev,
      totalIssued: prev.totalIssued + 1,
      byType: {
        ...prev.byType,
        [type]: { ...prev.byType[type], issued: prev.byType[type].issued + 1 }
      }
    }));

    if (Math.random() < 0.05) {
      setTimeout(() => {
        setPasswords(prev => prev.map(p => 
          p.id === newPassword.id ? { ...p, status: 'discarded' as const } : p
        ));
      }, Math.random() * 10000 + 5000);
    }
  };

  const callNextPassword = () => {
    const waiting = passwords.filter(p => p.status === 'waiting');
    
    let nextPassword: Password | undefined;

    if (lastCalledType === null || lastCalledType === 'SG' || lastCalledType === 'SE') {
      nextPassword = waiting.find(p => p.type === 'SP');
      if (!nextPassword) {
        nextPassword = waiting.find(p => p.type === 'SE') || waiting.find(p => p.type === 'SG');
      }
    } else if (lastCalledType === 'SP') {
      nextPassword = waiting.find(p => p.type === 'SE') || waiting.find(p => p.type === 'SG');
    }

    if (nextPassword) {
      const updatedPassword = {
        ...nextPassword,
        status: 'called' as const,
        counter: currentCounter,
        attendedAt: new Date()
      };

      setPasswords(passwords => passwords.map(p => 
        p.id === nextPassword.id ? updatedPassword : p
      ));

      setRecentCalls(recentCalls => [updatedPassword, ...recentCalls.slice(0, 4)]);
      setLastCalledType(nextPassword.type);
      
      setStats(stats => ({
        ...stats,
        totalAttended: stats.totalAttended + 1,
        byType: {
          ...stats.byType,
          [nextPassword.type]: { 
            ...stats.byType[nextPassword.type], 
            attended: stats.byType[nextPassword.type].attended + 1 
          }
        }
      }));

      setTimeout(() => {
        setPasswords(passwords => passwords.map(password => 
          password.id === nextPassword.id ? { ...password, status: 'attended' as const } : password
        ));
      }, getServiceTime(nextPassword.type));
    }
  };

  const getServiceTime = (type: PasswordType): number => {
    switch (type) {
      case 'SP':
        return (15 + (Math.random() * 10 - 5)) * 60 * 1000;
      case 'SG':
        return (5 + (Math.random() * 6 - 3)) * 60 * 1000;
      case 'SE':
        return Math.random() < 0.95 ? 60 * 1000 : 5 * 60 * 1000;
    }
  };

  const getPasswordTypeLabel = (type: PasswordType): string => {
    switch (type) {
      case 'SP': return 'Prioritária';
      case 'SG': return 'Geral';
      case 'SE': return 'Retirada de Exames';
    }
  };

  const getPasswordColor = (type: PasswordType): string => {
    switch (type) {
      case 'SP': return 'bg-red-500';
      case 'SG': return 'bg-blue-500';
      case 'SE': return 'bg-green-500';
    }
  };

  const waitingCount = passwords.filter(p => p.status === 'waiting').length;

  const TotemView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Laboratório MedLab</h1>
            <p className="text-gray-600">Retire sua senha de atendimento</p>
            <div className="mt-4 text-sm text-gray-500">
              <Clock className="inline mr-2" size={16} />
              Horário de atendimento: 7h às 17h
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => issuePassword('SP')}
              className="bg-gradient-to-br from-red-500 to-red-600 text-white p-8 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <div className="text-6xl font-bold mb-2">SP</div>
              <div className="text-lg font-semibold">Atendimento Prioritário</div>
              <div className="text-sm opacity-90 mt-2">Idosos, gestantes, PCD</div>
            </button>

            <button
              onClick={() => issuePassword('SG')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <div className="text-6xl font-bold mb-2">SG</div>
              <div className="text-lg font-semibold">Atendimento Geral</div>
              <div className="text-sm opacity-90 mt-2">Consultas e procedimentos</div>
            </button>

            <button
              onClick={() => issuePassword('SE')}
              className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <div className="text-6xl font-bold mb-2">SE</div>
              <div className="text-lg font-semibold">Retirada de Exames</div>
              <div className="text-sm opacity-90 mt-2">Atendimento rápido</div>
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <p className="text-gray-700 font-medium">
              <Users className="inline mr-2" size={20} />
              {waitingCount} {waitingCount === 1 ? 'pessoa aguardando' : 'pessoas aguardando'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const PanelView = () => (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-white text-center mb-2">Painel de Chamadas</h1>
          <p className="text-gray-400 text-center">Laboratório MedLab</p>
        </div>

        {recentCalls.length > 0 && (
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-2xl p-12 mb-6">
            <div className="text-center">
              <div className="text-gray-200 text-2xl mb-4">CHAMANDO AGORA</div>
              <div className="text-9xl font-bold text-white mb-6">{recentCalls[0].number}</div>
              <div className="text-4xl text-gray-100">
                Guichê <span className="font-bold">{recentCalls[0].counter}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Últimas Chamadas</h2>
          <div className="space-y-4">
            {recentCalls.slice(1, 5).map((pwd, index) => (
              <div key={pwd.id} className="bg-gray-700 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getPasswordColor(pwd.type)} mr-4`}></div>
                  <span className="text-3xl font-bold text-white">{pwd.number}</span>
                </div>
                <span className="text-2xl text-gray-300">Guichê {pwd.counter}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AttendantView = () => {
    const waitingPasswords = passwords.filter(p => p.status === 'waiting');
    
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Painel do Atendente</h1>
                <p className="text-gray-600">Guichê {currentCounter}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentCounter(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Guichê -
                </button>
                <button
                  onClick={() => setCurrentCounter(prev => prev + 1)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Guichê +
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ação</h2>
              <button
                onClick={callNextPassword}
                disabled={waitingPasswords.length === 0}
                className="w-full bg-blue-600 text-white py-8 rounded-xl text-2xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                <Plus className="inline mr-2" size={32} />
                Chamar Próxima Senha
              </button>
              <p className="text-gray-600 text-center mt-4">
                {waitingPasswords.length} senha(s) aguardando
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Última Chamada</h2>
              {recentCalls.length > 0 ? (
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {recentCalls[0].number}
                  </div>
                  <div className="text-gray-600">
                    {getPasswordTypeLabel(recentCalls[0].type)}
                  </div>
                  <div className="text-gray-500 text-sm mt-2">
                    Guichê {recentCalls[0].counter}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Nenhuma senha chamada ainda
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Fila de Espera</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-red-600 font-bold text-lg">Prioritárias (SP)</div>
                <div className="text-3xl font-bold text-gray-800">
                  {waitingPasswords.filter(p => p.type === 'SP').length}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-blue-600 font-bold text-lg">Gerais (SG)</div>
                <div className="text-3xl font-bold text-gray-800">
                  {waitingPasswords.filter(p => p.type === 'SG').length}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-green-600 font-bold text-lg">Exames (SE)</div>
                <div className="text-3xl font-bold text-gray-800">
                  {waitingPasswords.filter(p => p.type === 'SE').length}
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {waitingPasswords.map(pwd => (
                <div key={pwd.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getPasswordColor(pwd.type)}`}></div>
                    <span className="font-mono font-bold text-lg">{pwd.number}</span>
                    <span className="text-gray-600">{getPasswordTypeLabel(pwd.type)}</span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {pwd.issuedAt.toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ReportsView = () => (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Relatórios</h1>
          <p className="text-gray-600">Estatísticas do dia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-1">Total Emitidas</div>
            <div className="text-4xl font-bold text-gray-800">{stats.totalIssued}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-1">Total Atendidas</div>
            <div className="text-4xl font-bold text-green-600">{stats.totalAttended}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-1">Aguardando</div>
            <div className="text-4xl font-bold text-blue-600">{waitingCount}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-1">Descartadas</div>
            <div className="text-4xl font-bold text-red-600">
              {passwords.filter(p => p.status === 'discarded').length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Prioritárias (SP)</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Emitidas:</span>
                <span className="font-bold">{stats.byType.SP.issued}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Atendidas:</span>
                <span className="font-bold text-green-600">{stats.byType.SP.attended}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Gerais (SG)</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Emitidas:</span>
                <span className="font-bold">{stats.byType.SG.issued}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Atendidas:</span>
                <span className="font-bold text-green-600">{stats.byType.SG.attended}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Exames (SE)</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Emitidas:</span>
                <span className="font-bold">{stats.byType.SE.issued}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Atendidas:</span>
                <span className="font-bold text-green-600">{stats.byType.SE.attended}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Histórico Detalhado</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Senha</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Tipo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Emissão</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Atendimento</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Guichê</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {passwords.slice().reverse().map(pwd => (
                  <tr key={pwd.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-sm">{pwd.number}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${getPasswordColor(pwd.type)}`}>
                        {pwd.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {pwd.issuedAt.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {pwd.attendedAt ? pwd.attendedAt.toLocaleString('pt-BR') : '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {pwd.counter || '-'}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium ${
                        pwd.status === 'attended' ? 'text-green-600' :
                        pwd.status === 'waiting' ? 'text-blue-600' :
                        pwd.status === 'called' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {pwd.status === 'attended' ? 'Atendida' :
                         pwd.status === 'waiting' ? 'Aguardando' :
                         pwd.status === 'called' ? 'Chamada' :
                         'Descartada'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <nav className="bg-gray-800 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold">Sistema de Controle de Atendimento</div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('totem')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                view === 'totem' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Plus size={20} />
              Totem
            </button>
            <button
              onClick={() => setView('panel')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                view === 'panel' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Monitor size={20} />
              Painel
            </button>
            <button
              onClick={() => setView('attendant')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                view === 'attendant' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Users size={20} />
              Atendente
            </button>
            <button
              onClick={() => setView('reports')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                view === 'reports' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <FileText size={20} />
              Relatórios
            </button>
          </div>
        </div>
      </nav>

      {view === 'totem' && <TotemView />}
      {view === 'panel' && <PanelView />}
      {view === 'attendant' && <AttendantView />}
      {view === 'reports' && <ReportsView />}
    </div>
  );
};