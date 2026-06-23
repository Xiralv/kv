import { Component } from '@angular/core';

export interface AttireRole {
  role: string;
  emoji: string;
  images: string[];    // paths under assets/images/attire/
  ladies?: {
    color: string;
    swatch: string;
    garment: string;
    fabric?: string;
    notes?: string[];
  };
  gents?: {
    garment: string;
    notes?: string[];
  };
  donts?: string[];
}

@Component({
  selector: 'app-attire',
  templateUrl: 'attire.page.html',
  styleUrls: ['attire.page.scss'],
  standalone: false,
})
export class AttirePage {

  activeRole: string = 'guests';

  roles: AttireRole[] = [
    {
      role: 'guests',
      emoji: '👥',
      images: ['assets/images/attire/guests-ladies.png', 'assets/images/attire/guests-gents.png'],
      ladies: {
        color: 'Light Brown · Sage Green · Dusty Blue',
        swatch: 'linear-gradient(90deg, #c9a882 33%, #8fad8a 33% 66%, #7a9bbf 66%)',
        garment: 'Formal maxi dress or pantsuit',
        notes: [
          'Any fabric is fine',
          'Maxi length preferred',
          'Avoid white, cream, or anything close to bridal white',
        ],
      },
      gents: {
        garment: 'White, Cream, or Off-white Barong (long or short sleeve)',
        notes: [
          'Any dark dress pants — black preferred',
          'White inner shirt',
        ],
      },
      donts: [
        'NO shorts',
        'NO khaki pants',
        'NO white, cream, or bridal-white for ladies',
        'NO loud prints or patterns',
      ],
    },
    {
      role: 'principal sponsors',
      emoji: '✨',
      images: ['assets/images/attire/sponsors.png','assets/images/attire/sponsors1.png'],
      ladies: {
        color: 'Champagne · Nude · Light Brown',
        swatch: 'linear-gradient(90deg, #e8d5a3 33%, #d4b896 33% 66%, #c9a882 66%)',
        garment: 'Long dress (any fabric)',
        notes: ['Any silhouette — floor length'],
      },
      gents: {
        garment: 'See-through Barong · White inner shirt · Black pants',
      },
      donts: [
        'DO NOT wear chino or brown pants',
        'DO NOT wear coat-type barong',
        'DO NOT wear chinese-collared barong',
      ],
    },
    {
      role: 'bridesmaids & secondary sponsors',
      emoji: '💐',
      images: ['assets/images/attire/bridesmaids.png'],
      ladies: {
        color: 'Sage Green',
        swatch: '#8fad8a',
        garment: 'Sage Green Chiffon Dress',
        fabric: 'Lightweight, sheer, and flowing fabric',
        notes: ['Floor length', 'Chiffon fabric specifically'],
      },
    },
    {
      role: 'maid of honour',
      emoji: '👑',
      images: ['assets/images/attire/moh.png'],
      ladies: {
        color: 'Sage Green',
        swatch: '#8fad8a',
        garment: 'Sage Green Silk / Satin Dress',
        fabric: 'Gloss and reflective fabric — silk or satin',
        notes: ['Floor length', 'Silk or satin fabric specifically — distinguishes MOH from bridesmaids'],
      },
    },
    {
      role: 'best men',
      emoji: '🤵',
      images: ['assets/images/attire/bestmen.png'],
      gents: {
        garment: 'Cream see-through Barong · White inner shirt · Black pants',
      },
      donts: [
        'DO NOT wear chino or brown pants',
        'DO NOT wear coat-type barong',
        'DO NOT wear chinese-collared barong',
      ],
    },
    {
      role: 'flower ladies',
      emoji: '🌸',
      images: ['assets/images/attire/flowerladies.png'],
      ladies: {
        color: 'Sage Green',
        swatch: '#8fad8a',
        garment: 'Sage Green Tulle Dress',
        fabric: 'Open-weave mesh that holds its own shape',
      },
    },
    {
      role: 'mini entourage',
      emoji: '🌟',
      images: ['assets/images/attire/minientourage.png'],
      ladies: {
        color: 'White with Sage Green Tulle Ribbon',
        swatch: 'linear-gradient(90deg, #fff 50%, #8fad8a 50%)',
        garment: 'White dress with Sage Green Tulle Ribbon',
        notes: ['White shoes', 'Tulle ribbon will be provided by the couple'],
      },
      gents: {
        garment: 'White / Off-white barong · Black pants · Black shoes',
      },
      donts: ['No coat-type barongs please'],
    },
  ];

  setActive(role: string) {
    this.activeRole = role;
  }

  get activeAttire(): AttireRole {
    return this.roles.find(r => r.role === this.activeRole) || this.roles[0];
  }
}