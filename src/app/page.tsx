
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Landmark, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const [isPending, setIsPending] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      router.push('/dashboard');
    }
  }, [auth.currentUser, router]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsPending(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro de Login',
        description: 'Credenciais inválidas. Por favor, verifique seu email e senha.',
      });
    } finally {
      setIsPending(false);
    }
  };

  const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/weak-password':
            return 'A senha deve ter pelo menos 6 caracteres.';
        case 'auth/email-already-in-use':
            return 'Este email já está em uso por outra conta.';
        case 'auth/invalid-email':
            return 'O formato do email fornecido é inválido.';
        default:
            return 'Não foi possível criar a conta. Tente novamente.';
    }
  }

  const handleSignUp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsPending(true);

    if (signupPassword !== signupConfirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erro no Cadastro',
        description: 'As senhas não coincidem. Por favor, tente novamente.',
      });
      setIsPending(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = userCredential.user;

      await updateProfile(user, { displayName: signupName });
      
      const userProfile = {
        id: user.uid,
        name: signupName,
        email: user.email,
      };
      
      if (firestore) {
        await setDoc(doc(firestore, 'users', user.uid), userProfile);
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro no Cadastro',
        description: getFriendlyErrorMessage(error.code),
      });
    } finally {
      setIsPending(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Tabs defaultValue="login" className="w-full max-w-sm">
            <Card>
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Landmark className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-headline">Bem-vindo ao Patrimonio</CardTitle>
                    <CardDescription>
                       Entre ou crie sua conta para gerenciar seus itens.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="login">Entrar</TabsTrigger>
                        <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <form onSubmit={handleLogin}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        required
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="login-password">Senha</Label>
                                    <div className="relative">
                                      <Input
                                          id="login-password"
                                          type={showLoginPassword ? 'text' : 'password'}
                                          required
                                          value={loginPassword}
                                          onChange={(e) => setLoginPassword(e.target.value)}
                                          disabled={isPending}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                                        aria-label={showLoginPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                      >
                                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full mt-2" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Entrar
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                    <TabsContent value="signup">
                        <form onSubmit={handleSignUp}>
                           <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="signup-name">Nome</Label>
                                    <Input 
                                        id="signup-name" 
                                        placeholder="Seu Nome Completo" 
                                        required 
                                        value={signupName}
                                        onChange={(e) => setSignupName(e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        required
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="signup-password">Senha</Label>
                                    <div className="relative">
                                      <Input 
                                          id="signup-password" 
                                          type={showSignupPassword ? 'text' : 'password'}
                                          required 
                                          value={signupPassword}
                                          onChange={(e) => setSignupPassword(e.target.value)}
                                          disabled={isPending}
                                      />
                                       <button
                                        type="button"
                                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                                        aria-label={showSignupPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                      >
                                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="signup-confirm-password">Confirmar Senha</Label>
                                    <div className="relative">
                                      <Input 
                                          id="signup-confirm-password" 
                                          type={showConfirmPassword ? 'text' : 'password'}
                                          required 
                                          value={signupConfirmPassword}
                                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                          disabled={isPending}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                                        aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                      >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full mt-2" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Criar Conta
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    </div>
  );
}
